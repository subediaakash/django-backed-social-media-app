from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import FriendRequest


User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', read_only=True)
    lastName = serializers.CharField(source='last_name', read_only=True)
    profilePicture = serializers.ImageField(source='profile_picture', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'firstName',
            'lastName',
            'profilePicture',
        ]


class FriendSearchResultSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', read_only=True)
    lastName = serializers.CharField(source='last_name', read_only=True)
    profilePicture = serializers.ImageField(source='profile_picture', read_only=True)
    relationshipStatus = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'firstName',
            'lastName',
            'profilePicture',
            'relationshipStatus',
        ]

    def get_relationshipStatus(self, obj):
        request = self.context['request']
        if obj.pk == request.user.pk:
            return 'self'

        friends_ids = self.context.get('friends_ids', set())
        outgoing_pending_ids = self.context.get('outgoing_pending_ids', set())
        incoming_pending_ids = self.context.get('incoming_pending_ids', set())

        if obj.pk in friends_ids:
            return 'friends'
        if obj.pk in outgoing_pending_ids:
            return 'pending_outgoing'
        if obj.pk in incoming_pending_ids:
            return 'pending_incoming'
        return 'none'


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = UserSummarySerializer(read_only=True)
    receiver = UserSummarySerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    respondedAt = serializers.DateTimeField(source='responded_at', read_only=True)

    class Meta:
        model = FriendRequest
        fields = [
            'id',
            'sender',
            'receiver',
            'status',
            'createdAt',
            'respondedAt',
        ]
        read_only_fields = fields


class FriendRequestCreateSerializer(serializers.Serializer):
    receiverId = serializers.PrimaryKeyRelatedField(
        source='receiver',
        queryset=User.objects.all(),
    )

    def validate_receiver(self, receiver):
        request = self.context['request']
        user = request.user
        if receiver == user:
            raise serializers.ValidationError('You cannot send a friend request to yourself.')
        if user.friends.filter(pk=receiver.pk).exists():
            raise serializers.ValidationError('You are already friends.')

        existing = FriendRequest.objects.filter(sender=user, receiver=receiver).first()
        if existing and existing.status == FriendRequest.Status.PENDING:
            raise serializers.ValidationError('Friend request already pending.')
        if existing and existing.status == FriendRequest.Status.ACCEPTED:
            raise serializers.ValidationError('Friend request already accepted.')

        incoming_pending = FriendRequest.objects.filter(
            sender=receiver,
            receiver=user,
            status=FriendRequest.Status.PENDING,
        ).first()
        if incoming_pending:
            raise serializers.ValidationError('You already have a pending request from this user.')
        self.existing_request = existing
        return receiver

    def create(self, validated_data):
        request = self.context['request']
        receiver = validated_data['receiver']
        existing = getattr(self, 'existing_request', None)
        if existing:
            existing.status = FriendRequest.Status.PENDING
            existing.responded_at = None
            existing.save(update_fields=['status', 'responded_at'])
            return existing
        return FriendRequest.objects.create(sender=request.user, receiver=receiver)


class FriendRequestRespondSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['accept', 'reject'])

