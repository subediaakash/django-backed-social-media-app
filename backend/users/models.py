from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    friends = models.ManyToManyField(
        'self',
        symmetrical=True,
        blank=True,
    )

    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username