from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import FriendRequest

User = get_user_model()


class FriendSearchViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='password123',
        )
        self.friend = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='password123',
        )
        self.non_friend = User.objects.create_user(
            username='charlie',
            email='charlie@example.com',
            password='password123',
        )
        self.pending_outgoing = User.objects.create_user(
            username='diana',
            email='diana@example.com',
            password='password123',
        )
        self.pending_incoming = User.objects.create_user(
            username='eve',
            email='eve@example.com',
            password='password123',
        )

        self.user.friends.add(self.friend)
        FriendRequest.objects.create(
            sender=self.user,
            receiver=self.pending_outgoing,
            status=FriendRequest.Status.PENDING,
        )
        FriendRequest.objects.create(
            sender=self.pending_incoming,
            receiver=self.user,
            status=FriendRequest.Status.PENDING,
        )

        self.url = reverse('friends:friend-search')

    def authenticate(self):
        self.client.force_authenticate(self.user)

    def test_default_suggestions_exclude_self_and_friends(self):
        self.authenticate()
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {item['id']: item for item in response.data}

        self.assertNotIn(self.user.id, returned_ids)
        self.assertNotIn(self.friend.id, returned_ids)

        self.assertEqual(
            returned_ids[self.non_friend.id]['relationshipStatus'],
            'none',
        )
        self.assertEqual(
            returned_ids[self.pending_outgoing.id]['relationshipStatus'],
            'pending_outgoing',
        )
        self.assertEqual(
            returned_ids[self.pending_incoming.id]['relationshipStatus'],
            'pending_incoming',
        )

    def test_search_results_include_friends_with_status(self):
        self.authenticate()
        response = self.client.get(self.url, {'q': 'bob'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {item['id']: item for item in response.data}

        self.assertIn(self.friend.id, returned_ids)
        self.assertEqual(
            returned_ids[self.friend.id]['relationshipStatus'],
            'friends',
        )


class FriendRequestListViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='zoe',
            email='zoe@example.com',
            password='password123',
        )
        self.incoming_sender_pending = User.objects.create_user(
            username='ian',
            email='ian@example.com',
            password='password123',
        )
        self.incoming_sender_accepted = User.objects.create_user(
            username='judy',
            email='judy@example.com',
            password='password123',
        )
        self.outgoing_receiver_pending = User.objects.create_user(
            username='karl',
            email='karl@example.com',
            password='password123',
        )
        self.outgoing_receiver_rejected = User.objects.create_user(
            username='lisa',
            email='lisa@example.com',
            password='password123',
        )

        FriendRequest.objects.create(
            sender=self.incoming_sender_pending,
            receiver=self.user,
            status=FriendRequest.Status.PENDING,
        )
        FriendRequest.objects.create(
            sender=self.incoming_sender_accepted,
            receiver=self.user,
            status=FriendRequest.Status.ACCEPTED,
        )
        FriendRequest.objects.create(
            sender=self.user,
            receiver=self.outgoing_receiver_pending,
            status=FriendRequest.Status.PENDING,
        )
        FriendRequest.objects.create(
            sender=self.user,
            receiver=self.outgoing_receiver_rejected,
            status=FriendRequest.Status.REJECTED,
        )

        self.url = reverse('friends:friend-request-list-create')

    def authenticate(self):
        self.client.force_authenticate(self.user)

    def test_filter_incoming_pending_requests(self):
        self.authenticate()
        response = self.client.get(self.url, {'status': FriendRequest.Status.PENDING})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        request_data = response.data[0]
        self.assertEqual(request_data['sender']['username'], 'ian')
        self.assertEqual(request_data['status'], FriendRequest.Status.PENDING)

    def test_filter_outgoing_pending_requests(self):
        self.authenticate()
        response = self.client.get(
            self.url,
            {
                'direction': 'outgoing',
                'status': FriendRequest.Status.PENDING,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        request_data = response.data[0]
        self.assertEqual(request_data['receiver']['username'], 'karl')
        self.assertEqual(request_data['status'], FriendRequest.Status.PENDING)
