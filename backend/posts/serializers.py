from django.contrib.auth import get_user_model
from rest_framework import serializers

from groups.models import Group
from .models import Comment, Like, Post


User = get_user_model()


class PostAuthorSerializer(serializers.ModelSerializer):
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


class CommentSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'post',
            'author',
            'content',
            'createdAt',
            'updatedAt',
        ]
        read_only_fields = [
            'id',
            'post',
            'author',
            'createdAt',
            'updatedAt',
        ]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Content cannot be empty.')
        return value


class LikeSerializer(serializers.ModelSerializer):
    user = PostAuthorSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Like
        fields = [
            'id',
            'post',
            'user',
            'createdAt',
        ]
        read_only_fields = [
            'id',
            'post',
            'user',
            'createdAt',
        ]


class GroupSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = [
            'id',
            'name',
            'description',
        ]


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    likesCount = serializers.IntegerField(source='likes_count', read_only=True)
    commentsCount = serializers.IntegerField(source='comments_count', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    group = GroupSummarySerializer(read_only=True)
    viewerHasLiked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'content',
            'createdAt',
            'likesCount',
            'commentsCount',
            'comments',
            'group',
            'viewerHasLiked',
        ]
        read_only_fields = [
            'id',
            'author',
            'createdAt',
            'likesCount',
            'commentsCount',
            'comments',
            'group',
            'viewerHasLiked',
        ]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Content cannot be empty.')
        return value

    def get_viewerHasLiked(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if not user or not user.is_authenticated:
            return False

        annotated_value = getattr(obj, 'liked_by_current_user', None)
        if annotated_value is not None:
            return bool(annotated_value)

        return obj.post_likes.filter(user_id=user.pk).exists()

