# Social Media App

A full-stack social media application built with Django REST Framework backend
and React frontend.

## Tech Stack

- **Backend**: Django 5.2.8, Django REST Framework, PostgreSQL, JWT
  Authentication
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Query, Jotai
- **Database**: PostgreSQL
- **Package Managers**: pip (backend), Bun (frontend)

## Features

- User authentication and authorization
- Posts with media uploads
- Groups functionality
- Friends system
- Notifications
- User profiles
- Search functionality

## Prerequisites

Before setting up the project locally, ensure you have the following installed:

- **Python 3.12+**
- **Node.js 18+** (for Bun)
- **PostgreSQL** (or Docker for containerized setup)
- **Git**

## Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd social-media-app-using-django
```

### 2. Backend Setup

#### Option A: Using Virtual Environment (Recommended)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Option B: Using Docker

```bash
# Navigate to backend directory
cd backend

# Start PostgreSQL and Redis (if needed)
docker-compose up -d postgres
```

### 3. Database Setup

#### Using PostgreSQL Directly

1. Create a PostgreSQL database:

```sql
CREATE DATABASE social_media_db;
CREATE USER social_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE social_media_db TO social_user;
```

2. Create `.env` file in the `backend` directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://social_user:your_password@localhost:5432/social_media_db
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Using Docker Compose

```bash
cd backend
docker-compose up -d
```

### 4. Run Backend Migrations

```bash
cd backend

# Activate virtual environment if not already activated
source venv/bin/activate

# Run migrations
python manage.py migrate

# (Optional) Seed the database with sample data
python manage.py seed
```

### 5. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies using Bun
bun install

# Start development server
bun run dev
```

### 6. Start the Backend Server

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Start Django development server
python manage.py runserver
```

## Running the Application

1. **Backend**: Runs on `http://localhost:8000`
2. **Frontend**: Runs on `http://localhost:5173` (Vite default)

Open your browser and navigate to `http://localhost:5173` to access the
application.

## Available Scripts

### Backend Scripts

```bash
# Run development server
python manage.py runserver

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Seed database
python manage.py seed
```

### Frontend Scripts

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run linter
bun run lint
```

## API Documentation

Once the backend is running, you can access the API documentation at:

- **Django REST Framework**: `http://localhost:8000/api/`
- **Admin Panel**: `http://localhost:8000/admin/`

## Project Structure

```
social-media-app-using-django/
├── backend/                 # Django backend
│   ├── backend/            # Django project settings
│   ├── posts/              # Posts app
│   ├── users/              # User management app
│   ├── friends/            # Friends functionality
│   ├── groups/             # Groups functionality
│   ├── notifications/      # Notifications app
│   ├── manage.py           # Django management script
│   ├── requirements.txt    # Python dependencies
│   ├── docker-compose.yml  # Docker services
│   └── README.md           # Backend-specific docs
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript type definitions
│   ├── package.json       # Node dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── README.md          # Frontend-specific docs
└── README.md              # This file
```

## Environment Variables

### Backend (.env)

```env
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend

The frontend uses Vite's environment variable system. Create `.env.local` in the
frontend directory if needed:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
python manage.py test
```

### Frontend Tests

```bash
cd frontend
bun run test  # If testing is configured
```

## Deployment

### Backend Deployment

1. Set `DEBUG=False` in production
2. Use a production-grade database
3. Configure proper CORS settings
4. Set up proper static file serving
5. Use environment variables for secrets

### Frontend Deployment

```bash
cd frontend
bun run build
```

The `dist` folder contains the production build that can be served by any static
file server.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Submit a pull request

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check your `.env` file configuration
   - Verify database credentials

2. **CORS Errors**
   - Check `CORS_ALLOWED_ORIGINS` in Django settings
   - Ensure frontend is running on the correct port

3. **Module Not Found Errors**
   - Ensure virtual environment is activated (backend)
   - Run `bun install` in frontend directory

4. **Port Conflicts**
   - Backend: Change port with `python manage.py runserver 8001`
   - Frontend: Change port in `vite.config.ts` or use `bun run dev --port 3000`

### Getting Help

If you encounter issues not covered here, please check:

- The specific README files in `backend/` and `frontend/` directories
- Django documentation: https://docs.djangoproject.com/
- React documentation: https://react.dev/
- Vite documentation: https://vitejs.dev/

## License

This project is licensed under the MIT License - see the LICENSE file for
details.
