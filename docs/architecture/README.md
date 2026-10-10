# CampusVerse Architecture Documentation

This directory contains system design documents, architecture decision records (ADRs), and component diagrams for the CampusVerse platform.

## High-Level Overview

CampusVerse is structured as a decoupled monorepo:

- **Frontend (`frontend/`)**: Next.js App Router (TypeScript, Tailwind CSS) providing responsive web and mobile-first interfaces.
- **Backend (`backend/`)**: Python FastAPI asynchronous backend following clean architecture (APIs, Services, Repositories, Database models).
- **Database (`database/`)**: PostgreSQL with SQLAlchemy ORM and Alembic migrations. Authentication & storage integration prepared for Supabase.
