from django.contrib.auth import get_user_model
from rest_framework import serializers

from posts.serializers import PostSerializer
from .models import Group, GroupMembership


User = get_user_model()


class GroupUserSerializer(serializers.ModelSerializer):
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


class GroupSerializer(serializers.ModelSerializer):
    owner = GroupUserSerializer(read_only=True)
    membersCount = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            'id',
            'name',
            'description',
            'owner',
            'membersCount',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'owner',
            'membersCount',
            'created_at',
        ]

    def get_membersCount(self, obj):
        return obj.members.count()


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = [
            'name',
            'description',
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Name cannot be blank.')
        return value

    def create(self, validated_data):
        request = self.context['request']
        group = Group.objects.create(owner=request.user, **validated_data)
        GroupMembership.objects.create(
            group=group,
            user=request.user,
            role=GroupMembership.Role.OWNER,
        )
        return group


class GroupMembershipSerializer(serializers.ModelSerializer):
    user = GroupUserSerializer(read_only=True)

    class Meta:
        model = GroupMembership
        fields = [
            'id',
            'user',
            'role',
            'joined_at',
        ]
        read_only_fields = fields


class GroupPostSerializer(PostSerializer):
    class Meta(PostSerializer.Meta):
        read_only_fields = PostSerializer.Meta.read_only_fields

