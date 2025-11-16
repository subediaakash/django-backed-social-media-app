from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FriendRequest
from .serializers import (
    FriendRequestCreateSerializer,
    FriendRequestRespondSerializer,
    FriendRequestSerializer,
    UserSummarySerializer,
)

User = get_user_model()


class FriendListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSummarySerializer

    def get_queryset(self):
        return self.request.user.friends.all().order_by('username')


class FriendRequestListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        direction = self.request.query_params.get('direction', 'incoming')
        qs = FriendRequest.objects.select_related('sender', 'receiver')
        if direction == 'outgoing':
            return qs.filter(sender=self.request.user)
        if direction == 'all':
            return qs.filter(
                Q(sender=self.request.user) | Q(receiver=self.request.user)
            )
        return qs.filter(receiver=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FriendRequestCreateSerializer
        return FriendRequestSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save()


class FriendRequestDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendRequestSerializer
    queryset = FriendRequest.objects.select_related('sender', 'receiver')

    def get_object(self):
        instance = super().get_object()
        if instance.sender != self.request.user and instance.receiver != self.request.user:
            raise PermissionDenied('You do not have access to this friend request.')
        return instance

    def perform_destroy(self, instance):
        if instance.status != FriendRequest.Status.PENDING:
            raise PermissionDenied('Only pending requests can be cancelled.')
        if instance.sender != self.request.user and instance.receiver != self.request.user:
            raise PermissionDenied('You can only cancel your own pending requests.')
        instance.delete()


class FriendRequestRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        friend_request = get_object_or_404(
            FriendRequest.objects.select_related('sender', 'receiver'),
            pk=pk,
        )
        if friend_request.receiver != request.user:
            raise PermissionDenied('Only the receiver can respond to a friend request.')
        if friend_request.status != FriendRequest.Status.PENDING:
            return Response(
                {'detail': 'This friend request has already been processed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = FriendRequestRespondSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']
        if action == 'accept':
            friend_request.mark_accepted()
            request.user.friends.add(friend_request.sender)
        else:
            friend_request.mark_rejected()

        data = FriendRequestSerializer(friend_request).data
        return Response(data, status=status.HTTP_200_OK)
