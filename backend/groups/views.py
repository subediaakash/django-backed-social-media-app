from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from posts.models import Post
from .models import Group, GroupMembership
from .serializers import (
    GroupCreateSerializer,
    GroupMembershipSerializer,
    GroupPostSerializer,
    GroupSerializer,
)


class GroupListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Group.objects.select_related('owner').prefetch_related('members')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GroupCreateSerializer
        return GroupSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save()


class GroupDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Group.objects.select_related('owner').prefetch_related('members')
    serializer_class = GroupSerializer


class GroupMembersListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupMembershipSerializer

    def get_queryset(self):
        group = get_object_or_404(Group.objects.prefetch_related('group_memberships__user'), pk=self.kwargs['group_id'])
        if not group.members.filter(pk=self.request.user.pk).exists():
            raise PermissionDenied('You must join this group to view members.')
        return group.group_memberships.select_related('user').order_by('user__username')


class GroupJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id)
        membership, created = GroupMembership.objects.get_or_create(
            group=group,
            user=request.user,
            defaults={'role': GroupMembership.Role.MEMBER},
        )
        if not created and membership.role == GroupMembership.Role.MEMBER:
            return Response({'detail': 'You are already a member of this group.'}, status=status.HTTP_200_OK)
        data = GroupSerializer(group, context={'request': request}).data
        return Response(data, status=status.HTTP_200_OK)


class GroupLeaveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id)
        try:
            membership = GroupMembership.objects.get(group=group, user=request.user)
        except GroupMembership.DoesNotExist:
            return Response({'detail': 'You are not a member of this group.'}, status=status.HTTP_400_BAD_REQUEST)
        if membership.role == GroupMembership.Role.OWNER:
            return Response({'detail': 'Group owners cannot leave their own group.'}, status=status.HTTP_400_BAD_REQUEST)
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupMemberRemoveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, group_id, user_id):
        group = get_object_or_404(Group, pk=group_id)
        if group.owner != request.user:
            raise PermissionDenied('Only the group owner can remove members.')
        membership = get_object_or_404(GroupMembership, group=group, user_id=user_id)
        if membership.role == GroupMembership.Role.OWNER:
            return Response({'detail': 'You cannot remove the group owner.'}, status=status.HTTP_400_BAD_REQUEST)
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupPostListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupPostSerializer

    def get_group(self):
        group = get_object_or_404(Group.objects.prefetch_related('members'), pk=self.kwargs['group_id'])
        if not group.members.filter(pk=self.request.user.pk).exists():
            raise PermissionDenied('You must join this group to view or create posts.')
        return group

    def get_queryset(self):
        group = self.get_group()
        return (
            Post.objects.filter(group=group)
            .select_related('author', 'group')
            .prefetch_related('comments__author')
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        group = self.get_group()
        serializer.save(author=self.request.user, group=group)
