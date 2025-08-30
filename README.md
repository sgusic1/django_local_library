# django_local_library
A compact library system built with Django.

## Features
- Browse the catalog: Books and Authors
  - List views with pagination
  - Detail pages
- Manage data with full create / update / delete flows
- User accounts: sign-up, sign-in, sign-out; password change/reset
- Access control:
  - Login required for protected pages
  - Model permissions (e.g. add/change/delete/view)
  - Optional role groups (e.g. Librarian, Member)
- Admin site tuned for quick data entry (filters, inlines)

## Tech stack
- Python + Django
- ORM/DB: SQLite by default
- Templates: Django Template Language (DTL)
- Auth: django.contrib.auth (users, groups, permissions)

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
### 5) Run the development server
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

