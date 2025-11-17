# Database Seeding Guide

This guide explains how to seed your Django database with sample data for
development and testing purposes.

## Overview

The seed command creates:

- **10 sample users** with profiles and bios
- **Friendships** between users
- **Friend requests** (pending, accepted, and rejected)
- **5 groups** with members and different roles
- **22 posts** (both personal and group posts)
- **Likes** on posts (2-6 likes per post)
- **Comments** on posts (1-4 comments per post)

## How to Run the Seed Command

### Prerequisites

1. Make sure you have activated your virtual environment:

```bash
cd backend
source venv/bin/activate  # On Linux/Mac
# OR
venv\Scripts\activate  # On Windows
```

2. Ensure your database is set up and migrations are applied:

```bash
python manage.py migrate
```

### Basic Usage

To seed the database with sample data:

```bash
python manage.py seed
```

### Clear and Reseed

To clear all existing data and start fresh:

```bash
python manage.py seed --clear
```

⚠️ **Warning**: The `--clear` flag will delete ALL data from your database
including:

- All users
- All posts, likes, and comments
- All groups and memberships
- All friend requests

Only use this in development environments!

## Sample User Credentials

All seeded users have the same password for easy testing:

**Password**: `password123`

### User Accounts

| Username      | Email              | Full Name     |
| ------------- | ------------------ | ------------- |
| john_doe      | john@example.com   | John Doe      |
| jane_smith    | jane@example.com   | Jane Smith    |
| mike_wilson   | mike@example.com   | Mike Wilson   |
| sarah_jones   | sarah@example.com  | Sarah Jones   |
| alex_brown    | alex@example.com   | Alex Brown    |
| emily_davis   | emily@example.com  | Emily Davis   |
| chris_miller  | chris@example.com  | Chris Miller  |
| lisa_anderson | lisa@example.com   | Lisa Anderson |
| david_taylor  | david@example.com  | David Taylor  |
| rachel_white  | rachel@example.com | Rachel White  |

## What Gets Created

### Users

- 10 diverse users with unique usernames, emails, and bios
- Each user has a first name and last name

### Friendships

- Pre-established friend connections between users
- Symmetric relationships (if A is friends with B, B is friends with A)

### Friend Requests

- Mix of pending, accepted, and rejected friend requests
- Demonstrates the full friend request lifecycle

### Groups

1. **Web Development Hub** - For web developers (4 members)
2. **Tech Enthusiasts** - Technology discussions (4 members)
3. **Photography Club** - Photography sharing (4 members)
4. **Fitness & Wellness** - Fitness support (3 members)
5. **Book Club** - Book discussions (4 members)

Each group has:

- An owner (role: owner)
- At least one admin (role: admin)
- Regular members (role: member)

### Posts

- Personal posts on user timelines
- Group posts in various groups
- Posts created at different times over the past 2 weeks
- Realistic content relevant to each user/group

### Engagement

- **Likes**: Each post receives 2-6 likes from different users
- **Comments**: Each post receives 1-4 comments
- Like and comment counts are automatically updated

## Verifying the Seed Data

After seeding, you can verify the data in several ways:

### Using Django Admin

1. Create a superuser if you haven't already:

```bash
python manage.py createsuperuser
```

2. Run the development server:

```bash
python manage.py runserver
```

3. Visit `http://localhost:8000/admin` and login

### Using Django Shell

```bash
python manage.py shell
```

Then run:

```python
from django.contrib.auth import get_user_model
from posts.models import Post
from groups.models import Group

User = get_user_model()

# Check users
print(f"Total users: {User.objects.count()}")

# Check posts
print(f"Total posts: {Post.objects.count()}")
print(f"Personal posts: {Post.objects.filter(group__isnull=True).count()}")
print(f"Group posts: {Post.objects.filter(group__isnull=False).count()}")

# Check groups
print(f"Total groups: {Group.objects.count()}")

# Check a specific user's friends
john = User.objects.get(username='john_doe')
print(f"John's friends: {john.friends.count()}")
```

## Customizing the Seed Data

To customize the seed data, edit the `backend/users/management/commands/seed.py`
file:

- **Add more users**: Extend the `users_data` list in `create_users()`
- **Change friendships**: Modify the tuples in `create_friendships()`
- **Add more groups**: Extend the `groups_data` list in `create_groups()`
- **Add more posts**: Extend the `posts_data` list in `create_posts()`

## Troubleshooting

### Database is locked

If you get a "database is locked" error, make sure:

1. The development server is not running
2. No other processes are accessing the database

### IntegrityError

If you get an integrity error:

1. Run the seed command with `--clear` flag to start fresh
2. Ensure migrations are up to date: `python manage.py migrate`

### Import errors

If you get import errors, make sure:

1. Your virtual environment is activated
2. All dependencies are installed: `pip install -r requirements.txt`

## Best Practices

1. **Development Only**: Only use seeded data in development environments
2. **Regular Reseeding**: Use `--clear` flag to reseed when testing major
   changes
3. **Consistent Data**: The seed command creates consistent data, making it
   easier to test specific scenarios
4. **Version Control**: Keep the seed file in version control so all team
   members use the same test data

## Need Help?

If you encounter any issues or need to customize the seed data further, check:

- Django documentation: https://docs.djangoproject.com/
- The seed command source: `backend/users/management/commands/seed.py`
