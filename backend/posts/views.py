from django.db.models import BooleanField, Exists, F, OuterRef, Value
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment, Like, Post
from .serializers import CommentSerializer, LikeSerializer, PostSerializer


class ViewerLikeAnnotationMixin:
    def _annotate_viewer_like(self, queryset):
        user = getattr(self.request, 'user', None)
        if user and user.is_authenticated:
            return queryset.annotate(
                liked_by_current_user=Exists(
                    Like.objects.filter(post_id=OuterRef('pk'), user_id=user.pk)
                )
            )
        return queryset.annotate(
            liked_by_current_user=Value(False, output_field=BooleanField())
        )


class PostListCreateView(ViewerLikeAnnotationMixin, generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Post.objects.filter(group__isnull=True)
            .select_related('author')
            .prefetch_related('comments__author')
        )
        queryset = self._annotate_viewer_like(queryset)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(ViewerLikeAnnotationMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Post.objects.select_related('author', 'group').prefetch_related('comments__author')
        return self._annotate_viewer_like(queryset)

    def get_object(self):
        post = super().get_object()
        self._ensure_group_access(post)
        return post

    def perform_update(self, serializer):
        post = self.get_object()
        if post.author != self.request.user:
            raise PermissionDenied('You can only update your own posts.')
        self._ensure_group_access(post)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_group_access(instance)
        if instance.author != self.request.user:
            raise PermissionDenied('You can only delete your own posts.')
        instance.delete()

    def _ensure_group_access(self, post):
        if post.group_id and not post.group.members.filter(pk=self.request.user.pk).exists():
            raise PermissionDenied('You must be a member of this group to access this post.')



class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post.objects.select_related('group'), pk=post_id)
        self._ensure_group_access(post)
        return Comment.objects.filter(post_id=post_id).select_related('author', 'post').order_by('created_at')

    def perform_create(self, serializer):
        post = get_object_or_404(Post.objects.select_related('group'), pk=self.kwargs['post_id'])
        self._ensure_group_access(post)
        serializer.save(author=self.request.user, post=post)
        Post.objects.filter(pk=post.pk).update(comments_count=F('comments_count') + 1)

    def _ensure_group_access(self, post):
        if post.group_id and not post.group.members.filter(pk=self.request.user.pk).exists():
            raise PermissionDenied('You must be a member of this group to interact with comments here.')


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'comment_id'

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post.objects.select_related('group'), pk=post_id)
        self._ensure_group_access(post)
        return Comment.objects.filter(post_id=post_id).select_related('author', 'post')

    def perform_update(self, serializer):
        comment = self.get_object()
        self._ensure_group_access(comment.post)
        if comment.author != self.request.user:
            raise PermissionDenied('You can only edit your own comments.')
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_group_access(instance.post)
        if instance.author != self.request.user:
            raise PermissionDenied('You can only delete your own comments.')
        instance.delete()
        Post.objects.filter(pk=self.kwargs['post_id'], comments_count__gt=0).update(
            comments_count=F('comments_count') - 1
        )

    def _ensure_group_access(self, post):
        if post.group_id and not post.group.members.filter(pk=self.request.user.pk).exists():
            raise PermissionDenied('You must be a member of this group to interact with comments here.')


class LikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post.objects.select_related('group'), pk=post_id)
        if post.group_id and not post.group.members.filter(pk=request.user.pk).exists():
            raise PermissionDenied('You must be a member of this group to like this post.')
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if created:
            Post.objects.filter(pk=post_id).update(likes_count=F('likes_count') + 1)
            post.refresh_from_db(fields=['likes_count'])
            serializer = LikeSerializer(like)
            return Response(
                {'liked': True, 'likesCount': post.likes_count, 'like': serializer.data},
                status=status.HTTP_201_CREATED,
            )

        like.delete()
        Post.objects.filter(pk=post_id, likes_count__gt=0).update(likes_count=F('likes_count') - 1)
        post.refresh_from_db(fields=['likes_count'])
        return Response({'liked': False, 'likesCount': post.likes_count}, status=status.HTTP_200_OK)
