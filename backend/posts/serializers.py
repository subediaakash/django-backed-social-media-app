from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Post


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


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    likesCount = serializers.IntegerField(source='likes_count', read_only=True)
    commentsCount = serializers.IntegerField(source='comments_count', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'content',
            'createdAt',
            'likesCount',
            'commentsCount',
        ]
        read_only_fields = [
            'id',
            'author',
            'createdAt',
            'likesCount',
            'commentsCount',
        ]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Content cannot be empty.')
        return value

