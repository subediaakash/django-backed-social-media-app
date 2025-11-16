from django.contrib.auth import get_user_model
from rest_framework import serializers

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


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    likesCount = serializers.IntegerField(source='likes_count', read_only=True)
    commentsCount = serializers.IntegerField(source='comments_count', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

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
        ]
        read_only_fields = [
            'id',
            'author',
            'createdAt',
            'likesCount',
            'commentsCount',
            'comments',
        ]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Content cannot be empty.')
        return value

