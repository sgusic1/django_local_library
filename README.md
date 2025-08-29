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
  - Per-model permissions (e.g. add/change/delete/view)
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
