from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment, Like, Post
from .serializers import CommentSerializer, LikeSerializer, PostSerializer


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Post.objects.select_related('author')
            .prefetch_related('comments__author')
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Post.objects.select_related('author').prefetch_related('comments__author')

    def perform_update(self, serializer):
        post = self.get_object()
        if post.author != self.request.user:
            raise PermissionDenied('You can only update your own posts.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied('You can only delete your own posts.')
        instance.delete()


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        get_object_or_404(Post, pk=post_id)
        return Comment.objects.filter(post_id=post_id).select_related('author', 'post').order_by('created_at')

    def perform_create(self, serializer):
        post = get_object_or_404(Post, pk=self.kwargs['post_id'])
        serializer.save(author=self.request.user, post=post)
        Post.objects.filter(pk=post.pk).update(comments_count=F('comments_count') + 1)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'comment_id'

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        get_object_or_404(Post, pk=post_id)
        return Comment.objects.filter(post_id=post_id).select_related('author', 'post')

    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.author != self.request.user:
            raise PermissionDenied('You can only edit your own comments.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied('You can only delete your own comments.')
        instance.delete()
        Post.objects.filter(pk=self.kwargs['post_id'], comments_count__gt=0).update(
            comments_count=F('comments_count') - 1
        )


class LikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
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
