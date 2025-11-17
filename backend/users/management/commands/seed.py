from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from posts.models import Post, Like, Comment
from friends.models import FriendRequest
from groups.models import Group, GroupMembership
import random
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with sample data for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()
            self.stdout.write(self.style.SUCCESS('✓ Data cleared'))

        self.stdout.write('Starting database seeding...')
        
        # Create users
        users = self.create_users()
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(users)} users'))
        
        # Create friendships
        friendships_count = self.create_friendships(users)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {friendships_count} friendships'))
        
        # Create friend requests
        requests_count = self.create_friend_requests(users)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {requests_count} friend requests'))
        
        # Create groups
        groups = self.create_groups(users)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(groups)} groups'))
        
        # Create posts
        posts = self.create_posts(users, groups)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(posts)} posts'))
        
        # Create likes
        likes_count = self.create_likes(users, posts)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {likes_count} likes'))
        
        # Create comments
        comments_count = self.create_comments(users, posts)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {comments_count} comments'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeding completed successfully!'))

    def clear_data(self):
        """Clear all data from the database"""
        Comment.objects.all().delete()
        Like.objects.all().delete()
        Post.objects.all().delete()
        GroupMembership.objects.all().delete()
        Group.objects.all().delete()
        FriendRequest.objects.all().delete()
        User.objects.all().delete()

    def create_users(self):
        """Create sample users"""
        users_data = [
            {
                'username': 'john_doe',
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'bio': 'Software developer passionate about web technologies and open source.',
            },
            {
                'username': 'jane_smith',
                'email': 'jane@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'bio': 'UX Designer | Coffee enthusiast ☕ | Travel lover 🌍',
            },
            {
                'username': 'mike_wilson',
                'email': 'mike@example.com',
                'first_name': 'Mike',
                'last_name': 'Wilson',
                'bio': 'Data scientist exploring the world of AI and machine learning.',
            },
            {
                'username': 'sarah_jones',
                'email': 'sarah@example.com',
                'first_name': 'Sarah',
                'last_name': 'Jones',
                'bio': 'Digital marketer | Content creator | Dog mom 🐕',
            },
            {
                'username': 'alex_brown',
                'email': 'alex@example.com',
                'first_name': 'Alex',
                'last_name': 'Brown',
                'bio': 'Full-stack developer | Tech blogger | Gaming enthusiast 🎮',
            },
            {
                'username': 'emily_davis',
                'email': 'emily@example.com',
                'first_name': 'Emily',
                'last_name': 'Davis',
                'bio': 'Product manager helping teams build amazing products.',
            },
            {
                'username': 'chris_miller',
                'email': 'chris@example.com',
                'first_name': 'Chris',
                'last_name': 'Miller',
                'bio': 'Photographer | Nature lover 🌲 | Adventure seeker',
            },
            {
                'username': 'lisa_anderson',
                'email': 'lisa@example.com',
                'first_name': 'Lisa',
                'last_name': 'Anderson',
                'bio': 'Fitness trainer | Nutrition coach | Helping people live healthier lives',
            },
            {
                'username': 'david_taylor',
                'email': 'david@example.com',
                'first_name': 'David',
                'last_name': 'Taylor',
                'bio': 'Entrepreneur | Startup enthusiast | Always learning 📚',
            },
            {
                'username': 'rachel_white',
                'email': 'rachel@example.com',
                'first_name': 'Rachel',
                'last_name': 'White',
                'bio': 'Graphic designer creating beautiful visual experiences ✨',
            },
        ]

        users = []
        for user_data in users_data:
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password='password123',  # Same password for all test users
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                bio=user_data['bio'],
            )
            users.append(user)

        return users

    def create_friendships(self, users):
        """Create friendships between users"""
        friendships = [
            (0, 1), (0, 2), (0, 4),  # john_doe friends
            (1, 2), (1, 3), (1, 5),  # jane_smith friends
            (2, 3), (2, 6),          # mike_wilson friends
            (3, 4), (3, 7),          # sarah_jones friends
            (4, 5), (4, 8),          # alex_brown friends
            (5, 6), (5, 9),          # emily_davis friends
            (6, 7),                  # chris_miller friends
            (7, 8),                  # lisa_anderson friends
            (8, 9),                  # david_taylor friends
        ]

        for user1_idx, user2_idx in friendships:
            users[user1_idx].friends.add(users[user2_idx])

        return len(friendships)

    def create_friend_requests(self, users):
        """Create friend requests"""
        requests_data = [
            (0, 3, FriendRequest.Status.PENDING),    # john -> sarah (pending)
            (1, 7, FriendRequest.Status.PENDING),    # jane -> lisa (pending)
            (2, 8, FriendRequest.Status.PENDING),    # mike -> david (pending)
            (6, 9, FriendRequest.Status.PENDING),    # chris -> rachel (pending)
            (3, 9, FriendRequest.Status.ACCEPTED),   # sarah -> rachel (accepted)
            (5, 7, FriendRequest.Status.REJECTED),   # emily -> lisa (rejected)
        ]

        for sender_idx, receiver_idx, status in requests_data:
            FriendRequest.objects.create(
                sender=users[sender_idx],
                receiver=users[receiver_idx],
                status=status,
                responded_at=timezone.now() if status != FriendRequest.Status.PENDING else None
            )

        return len(requests_data)

    def create_groups(self, users):
        """Create groups with members"""
        groups_data = [
            {
                'name': 'Web Development Hub',
                'description': 'A community for web developers to share knowledge and resources.',
                'owner': users[0],
                'members': [users[0], users[1], users[4], users[5]],
            },
            {
                'name': 'Tech Enthusiasts',
                'description': 'Discussing the latest in technology and innovation.',
                'owner': users[2],
                'members': [users[0], users[2], users[4], users[8]],
            },
            {
                'name': 'Photography Club',
                'description': 'Share your best shots and photography tips!',
                'owner': users[6],
                'members': [users[1], users[3], users[6], users[9]],
            },
            {
                'name': 'Fitness & Wellness',
                'description': 'Supporting each other on our fitness journeys.',
                'owner': users[7],
                'members': [users[3], users[7], users[8]],
            },
            {
                'name': 'Book Club',
                'description': 'Monthly book discussions and recommendations.',
                'owner': users[9],
                'members': [users[1], users[5], users[8], users[9]],
            },
        ]

        groups = []
        for group_data in groups_data:
            group = Group.objects.create(
                name=group_data['name'],
                description=group_data['description'],
                owner=group_data['owner'],
            )
            
            # Add members
            for idx, member in enumerate(group_data['members']):
                role = GroupMembership.Role.OWNER if member == group_data['owner'] else GroupMembership.Role.MEMBER
                # Make some members admins
                if idx == 1 and member != group_data['owner']:
                    role = GroupMembership.Role.ADMIN
                
                GroupMembership.objects.create(
                    group=group,
                    user=member,
                    role=role,
                )
            
            groups.append(group)

        return groups

    def create_posts(self, users, groups):
        """Create posts (both personal and group posts)"""
        posts_data = [
            # Personal posts
            {'author': users[0], 'content': 'Just deployed my new portfolio website! Check it out and let me know what you think. 🚀', 'group': None},
            {'author': users[1], 'content': 'Beautiful sunset at the beach today. Sometimes you need to disconnect and enjoy the moment. 🌅', 'group': None},
            {'author': users[2], 'content': 'Working on an interesting machine learning project. The results are fascinating!', 'group': None},
            {'author': users[3], 'content': 'Just finished reading "Atomic Habits" - highly recommend it! Changed my perspective on building good habits. 📚', 'group': None},
            {'author': users[4], 'content': 'New blog post is live! Talking about the future of web development and emerging technologies.', 'group': None},
            {'author': users[5], 'content': 'Great product launch today! Proud of what the team accomplished. 🎉', 'group': None},
            {'author': users[6], 'content': 'Captured some amazing wildlife photos on my hike this weekend. Nature never disappoints! 📸', 'group': None},
            {'author': users[7], 'content': '30-day fitness challenge starts tomorrow! Who wants to join me? 💪', 'group': None},
            {'author': users[8], 'content': 'Excited to announce my new startup! More details coming soon... 🚀', 'group': None},
            {'author': users[9], 'content': 'Working on some new design concepts. Loving the creative process! ✨', 'group': None},
            
            # Group posts - Web Development Hub
            {'author': users[0], 'content': 'What\'s everyone\'s favorite JavaScript framework these days? I\'m exploring React and Vue.', 'group': groups[0]},
            {'author': users[4], 'content': 'Great article on CSS Grid vs Flexbox. Sharing the link in the comments!', 'group': groups[0]},
            {'author': users[1], 'content': 'Any recommendations for good UX design courses? Looking to expand my skills.', 'group': groups[0]},
            
            # Group posts - Tech Enthusiasts
            {'author': users[2], 'content': 'AI is advancing faster than ever. What are your thoughts on GPT-4 and its implications?', 'group': groups[1]},
            {'author': users[4], 'content': 'Just got the new MacBook Pro. The M3 chip is insanely fast! 🔥', 'group': groups[1]},
            
            # Group posts - Photography Club
            {'author': users[6], 'content': 'Here are my top 5 tips for landscape photography. Let me know what you think!', 'group': groups[2]},
            {'author': users[1], 'content': 'Anyone tried the new Sony camera? Looking for reviews before buying.', 'group': groups[2]},
            {'author': users[9], 'content': 'Sharing some of my favorite editing techniques for portrait photography.', 'group': groups[2]},
            
            # Group posts - Fitness & Wellness
            {'author': users[7], 'content': 'Monday motivation: Remember, progress over perfection! You\'ve got this! 💪', 'group': groups[3]},
            {'author': users[3], 'content': 'Meal prep Sunday! Sharing my healthy recipes for the week.', 'group': groups[3]},
            
            # Group posts - Book Club
            {'author': users[9], 'content': 'This month\'s book selection: "Project Hail Mary" by Andy Weir. Who\'s in?', 'group': groups[4]},
            {'author': users[8], 'content': 'Just finished "The Lean Startup". Great insights for entrepreneurs!', 'group': groups[4]},
        ]

        posts = []
        for idx, post_data in enumerate(posts_data):
            # Create posts at different times in the past
            created_time = timezone.now() - timedelta(days=random.randint(0, 14), hours=random.randint(0, 23))
            post = Post.objects.create(
                author=post_data['author'],
                content=post_data['content'],
                group=post_data['group'],
            )
            # Update the created_at to simulate posts from the past
            Post.objects.filter(pk=post.pk).update(created_at=created_time)
            posts.append(post)

        return posts

    def create_likes(self, users, posts):
        """Create likes for posts"""
        likes_count = 0
        
        for post in posts:
            # Each post gets liked by 2-6 random users (excluding the author)
            num_likes = random.randint(2, min(6, len(users) - 1))
            potential_likers = [u for u in users if u != post.author]
            likers = random.sample(potential_likers, num_likes)
            
            for liker in likers:
                Like.objects.create(
                    user=liker,
                    post=post,
                )
                likes_count += 1
            
            # Update the likes_count on the post
            post.likes_count = num_likes
            post.save(update_fields=['likes_count'])

        return likes_count

    def create_comments(self, users, posts):
        """Create comments for posts"""
        comments_data = [
            "Great post!",
            "Thanks for sharing this!",
            "This is really helpful 👍",
            "Love this! Keep it up!",
            "Interesting perspective!",
            "Couldn't agree more!",
            "This made my day 😊",
            "Amazing work!",
            "I learned something new today!",
            "Can you share more details?",
            "This is so inspiring!",
            "Exactly what I needed to read!",
            "Well said!",
            "Looking forward to more content like this!",
            "This is gold! 💯",
        ]

        comments_count = 0
        
        for post in posts:
            # Each post gets 1-4 random comments
            num_comments = random.randint(1, 4)
            
            for _ in range(num_comments):
                commenter = random.choice([u for u in users if u != post.author])
                comment_text = random.choice(comments_data)
                
                Comment.objects.create(
                    post=post,
                    author=commenter,
                    content=comment_text,
                )
                comments_count += 1
            
            # Update the comments_count on the post
            post.comments_count = num_comments
            post.save(update_fields=['comments_count'])

        return comments_count

