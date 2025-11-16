from django.urls import path

from .views import (
    CommentDetailView,
    CommentListCreateView,
    LikeToggleView,
    PostDetailView,
    PostListCreateView,
)


app_name = 'posts'

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:post_id>/like/', LikeToggleView.as_view(), name='post-like-toggle'),
    path('posts/<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('posts/<int:post_id>/comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
]

