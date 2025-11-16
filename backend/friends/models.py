from django.conf import settings
from django.db import models
from django.utils import timezone


class FriendRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='sent_friend_requests',
        on_delete=models.CASCADE,
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='received_friend_requests',
        on_delete=models.CASCADE,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['sender', 'receiver'],
                name='unique_friend_request_per_pair',
            ),
            models.CheckConstraint(
                check=~models.Q(sender=models.F('receiver')),
                name='prevent_self_friend_request',
            ),
        ]
        ordering = ['-created_at']

    def mark_accepted(self):
        self.status = self.Status.ACCEPTED
        self.responded_at = timezone.now()
        self.save(update_fields=['status', 'responded_at'])

    def mark_rejected(self):
        self.status = self.Status.REJECTED
        self.responded_at = timezone.now()
        self.save(update_fields=['status', 'responded_at'])

    def __str__(self):
        return f'{self.sender} -> {self.receiver} ({self.status})'
