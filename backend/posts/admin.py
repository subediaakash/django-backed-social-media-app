from django.contrib import admin

from .models import Comment, Like, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'group', 'created_at', 'likes_count', 'comments_count')
    list_filter = ('created_at', 'group')
    search_fields = ('author__username', 'content', 'group__name')
    autocomplete_fields = ('author', 'group')


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__content')
    autocomplete_fields = ('user', 'post')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'author', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('author__username', 'content')
    autocomplete_fields = ('post', 'author')
