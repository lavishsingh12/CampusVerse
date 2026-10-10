# CampusVerse Database Documentation

This directory contains database schema definitions, ER diagrams, and migration guidelines.

## Technology Stack

- **RDBMS**: PostgreSQL 16
- **ORM**: SQLAlchemy (2.0+ async style)
- **Migrations**: Alembic

## Migration Guidelines

1. Ensure the PostgreSQL container is running (`docker compose up -d`).
2. Activate your virtual environment in `backend/`.
3. Create a revision:
   ```bash
   alembic revision --autogenerate -m "description_of_change"
   ```
4. Apply migrations:
   ```bash
   alembic upgrade head
   ```
