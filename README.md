# django_local_library
A compact library system built with Django.

## Features
### Catalog
- Browse and search Books and Authors
- Paginated list and detail views
### Management
- Full CRUD flows for books and authors
- Browse the catalog: Books and Authors
- Permissions-based access control
- Fine-grained roles via Django Groups
### User Accounts
- Sign up, sign in, sign out
- Password reset and password change
- CSRF protection and secure sessions
### Admin Panel
- Django Admin tuned for quick data entry (filters, inlines, search)
  

## Tech stack
- Python 3.12+, Django 4.2+, Django REST Framework
- Frontend: React + Vite (built output served via Django static files)
- ORM/DB: PostgreSQL (default) / SQLite (local fallback)
- Templates: Django Template Language (DTL)
- Auth: django.contrib.auth (users, groups, permissions)
- Styling: Bootstrap 5 + custom SCSS + motion library

## Quick start
### 1) Start your Python environment
Activate your Python 3.12+ environment
### 2) Install dependencies
```bash
pip install -r requirements.txt
```
### 3) Set up the database schema
```bash
python manage.py migrate
```
### 4) Create an admin account
```bash
python manage.py createsuperuser
```
### 5) Build the React frontend
```bash
cd frontend
npm install
npm run build
cd ..
```
### 6) Run the development server
```bash
python manage.py runserver
```
#### then open http://localhost:8000

---
## 🐳 Docker Compose Setup
This repository includes a Docker Compose configuration for running the Django Local Library app.
It uses a persistent volume to store application data and separates migration from runtime for clean startup.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose v2+](https://docs.docker.com/compose/install/)
- Optional: .env file to support environment variables (e.g. Django superuser credentials)

## How It Works
### Services
 **`app`**
   - Builds the Django app from the included Dockerfile (or uses the prebuilt image sgusic29/django-local-library).
   - Runs python manage.py createsuperuser --noinput || true on startup (superuser creation is skipped if it already exists).
   - Serves the Django development server on port 8000.
   - Depends on the migrate service, ensuring database migrations are applied before startup.
   - Data is stored in a named volume (django_data) mounted at /app/data.
    
 **`migrate`**
   - Service that runs Django migrations (python manage.py migrate) against the same image and volume.
   - Ensures the database schema is ready before the app starts.
### Volumes 
 **`django_data`**
   - Persistent named volume that keeps Django’s database and other data across container restarts.

## Environment Variables
The app reads environment variables from a .env file in the project root. These variables are mainly used for creating the initial Django superuser (e.g. username, email, password).

## Usage
### Start App + Migrations
```bash
docker compose up -d
```
### Stop App
```bash
docker compose down
```
