# Social Media Backend (Django)

A learning-oriented social media API built with Django REST Framework. The
project covers custom user accounts, posts, likes and comments, friend
relationships, group-based collaboration, and JWT authentication suitable for a
React/Vue/Native front end.

## Stack & Structure

- **Framework**: Django 5 + Django REST Framework
- **Auth**: `djangorestframework-simplejwt` for stateless JWTs
- **Database**: PostgreSQL (configurable via env vars)
- **Apps**:
  - `users`: custom `User` model, registration, profile endpoints
  - `posts`: public and group posts, comments, likes
  - `friends`: send/accept/decline friend requests, list friends
  - `groups`: create/join/leave groups, manage members, group posts
  - `notifications` (placeholder for future work)

## Local Setup

```bash
# 1. Clone repo, then:
cd backend

# 2. Create/activate virtualenv (already present as ./venv)
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure database
# Ensure a PostgreSQL database exists or export env vars before running migrations
export POSTGRES_DB=poll_db
export POSTGRES_USER=poll_user
export POSTGRES_PASSWORD=poll_password
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432

# 5. Run migrations
python manage.py makemigrations users posts friends groups
python manage.py migrate

# 6. Start development server
python manage.py runserver
```

## Authentication Flow

1. `POST /api/auth/register/` – create an account (returns profile + JWT pair)
2. `POST /api/auth/login/` – obtain access/refresh tokens
3. For protected routes include:\
   `Authorization: Bearer <access_token>`
4. Refresh tokens when needed:\
   `POST /api/auth/token/refresh/`

## Key Endpoints & Sample Payloads

All endpoints are rooted at `http://127.0.0.1:8000/api/`.

### Users & Auth

| Method    | Path                   | Description          |
| --------- | ---------------------- | -------------------- |
| POST      | `/auth/register/`      | create account       |
| POST      | `/auth/login/`         | login (JWT)          |
| POST      | `/auth/token/refresh/` | refresh access token |
| GET/PATCH | `/users/me/`           | view/update profile  |

**Register request**

```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "demo",
  "email": "demo@example.com",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "firstName": "Demo",
  "lastName": "User"
}
```

### Posts, Likes, Comments

| Method           | Path                                    | Notes                                   |
| ---------------- | --------------------------------------- | --------------------------------------- |
| GET/POST         | `/posts/`                               | public feed & create post               |
| GET/PATCH/DELETE | `/posts/{postId}/`                      | read/update/delete (author only)        |
| POST             | `/posts/{postId}/like/`                 | toggle like (returns like/unlike state) |
| GET/POST         | `/posts/{postId}/comments/`             | list/create comments                    |
| GET/PATCH/DELETE | `/posts/{postId}/comments/{commentId}/` | manage own comment                      |

**Create post**

```http
POST /api/posts/
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "My first public post!"
}
```

**Add comment**

```http
POST /api/posts/12/comments/
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great update!"
}
```

### Friends

| Method   | Path                                     | Notes                                     |
| -------- | ---------------------------------------- | ----------------------------------------- |
| GET      | `/friends/`                              | list current friends                      |
| GET/POST | `/friends/requests/`                     | list incoming (default) or create request |
| GET      | `/friends/requests/?direction=outgoing`  | view sent requests                        |
| GET      | `/friends/requests/?direction=all`       | both directions                           |
| POST     | `/friends/requests/{requestId}/respond/` | accept/reject                             |
| DELETE   | `/friends/requests/{requestId}/`         | cancel pending                            |

**Send friend request**

```http
POST /api/friends/requests/
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": 7
}
```

**Respond to request**

```http
POST /api/friends/requests/15/respond/
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "accept"   // or "reject"
}
```

### Groups

| Method   | Path                                  | Description                   |
| -------- | ------------------------------------- | ----------------------------- |
| GET/POST | `/groups/`                            | list groups / create new one  |
| GET      | `/groups/{groupId}/`                  | group details                 |
| POST     | `/groups/{groupId}/join/`             | join group                    |
| POST     | `/groups/{groupId}/leave/`            | leave (non-owner)             |
| GET      | `/groups/{groupId}/members/`          | list members (must be member) |
| DELETE   | `/groups/{groupId}/members/{userId}/` | owner removes member          |
| GET/POST | `/groups/{groupId}/posts/`            | group feed & create post      |

**Create group**

```http
POST /api/groups/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chess Club",
  "description": "Weekly matches and openings practice"
}
```

**Create post inside group**

```http
POST /api/groups/4/posts/
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Meeting on Saturday at 5 PM."
}
```

### Group Posts via Global Post API

Group posts reuse the existing `/posts/{id}/...` endpoints for comments and
likes. Membership checks ensure only members can interact with group posts.

## Testing Tips

- Always include the trailing slash in URL paths (`APPEND_SLASH` is enabled).
- For Postman/cURL: add `Authorization: Bearer <access>` for any protected
  route.
- When working with `ImageField` (`profilePicture`), send multipart form-data
  with a file field.
- Use `python manage.py createsuperuser` to browse data quickly in Django admin.

## Next Ideas

- Pagination for feeds and comments
- Notifications when friend requests or group invites occur
- Moderation roles inside groups (promote/demote admins)
- REST API versioning & OpenAPI schema

Happy hacking! If you hit issues, check the server console for validation
errors—they are quite descriptive thanks to DRF.
