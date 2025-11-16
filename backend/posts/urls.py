from django.urls import path

from .views import PostDetailView, PostListCreateView


app_name = 'posts'

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
]

