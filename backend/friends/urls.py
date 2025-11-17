from django.urls import path

from .views import (
    FriendListView,
    FriendRequestDetailView,
    FriendRequestListCreateView,
    FriendRequestRespondView,
    FriendSearchView,
)


app_name = 'friends'

urlpatterns = [
    path('friends/search/', FriendSearchView.as_view(), name='friend-search'),
    path('friends/', FriendListView.as_view(), name='friend-list'),
    path('friends/requests/', FriendRequestListCreateView.as_view(), name='friend-request-list-create'),
    path('friends/requests/<int:pk>/', FriendRequestDetailView.as_view(), name='friend-request-detail'),
    path('friends/requests/<int:pk>/respond/', FriendRequestRespondView.as_view(), name='friend-request-respond'),
]

