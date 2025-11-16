from django.urls import path

from .views import (
    GroupDetailView,
    GroupJoinView,
    GroupLeaveView,
    GroupListCreateView,
    GroupMemberRemoveView,
    GroupMembersListView,
    GroupPostListCreateView,
)


app_name = 'groups'

urlpatterns = [
    path('groups/', GroupListCreateView.as_view(), name='group-list-create'),
    path('groups/<int:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('groups/<int:group_id>/members/', GroupMembersListView.as_view(), name='group-members'),
    path('groups/<int:group_id>/join/', GroupJoinView.as_view(), name='group-join'),
    path('groups/<int:group_id>/leave/', GroupLeaveView.as_view(), name='group-leave'),
    path('groups/<int:group_id>/members/<int:user_id>/', GroupMemberRemoveView.as_view(), name='group-member-remove'),
    path('groups/<int:group_id>/posts/', GroupPostListCreateView.as_view(), name='group-posts'),
]

