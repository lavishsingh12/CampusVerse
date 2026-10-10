# CampusVerse

CampusVerse is a college-only dating and social discovery platform designed to foster authentic campus connections.

This repository is organized as a production-ready monorepo containing the Next.js frontend, FastAPI backend, documentation, database tooling, and local development orchestration.

---

## Monorepo Structure

```text
campusverse/
├── frontend/                     # Next.js App Router (TypeScript, Tailwind CSS)
│   ├── src/
│   │   └── app/
│   │       ├── globals.css
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/                      # Python FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── health.py     # GET /api/v1/health
│   │   │       └── router.py     # v1 router registry
│   │   ├── core/
│   │   │   └── config.py         # Application settings (Pydantic Settings)
│   │   ├── db/
│   │   │   ├── base.py           # SQLAlchemy DeclarativeBase
│   │   │   └── session.py        # Async engine & sessionmaker
│   │   ├── models/               # SQLAlchemy ORM models (empty for now)
│   │   ├── schemas/              # Pydantic schemas (e.g. HealthResponse)
│   │   ├── services/             # Business & domain logic services
│   │   ├── repositories/         # Data persistence & access abstractions
│   │   └── main.py               # FastAPI entrypoint & middleware
│   ├── alembic/                  # Alembic migration management
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── alembic.ini
│   ├── pyproject.toml
│   └── requirements.txt
├── docs/                         # Architecture, API & DB documentation
│   ├── architecture/
│   ├── api/
│   └── database/
├── .env.example                  # Environment configuration template
├── .gitignore                    # Monorepo gitignore rules
├── docker-compose.yml            # Local PostgreSQL 16 container setup
└── README.md                     # Project documentation & setup instructions
```

---

## Prerequisites

- **Node.js**: v18.17+ or v20+ / v22+
- **Python**: 3.11+ or 3.12+ (accessible via `python` or `py`)
- **Docker & Docker Compose**: For local PostgreSQL database instance

---

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Configure variables as needed:
   - `DATABASE_URL`: PostgreSQL connection string (defaults to local docker postgres)
   - `SUPABASE_URL`: Supabase project URL
   - `SUPABASE_ANON_KEY`: Supabase client-side key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase server-side key
   - `SECRET_KEY`: Random 32+ character secret string

---

## Running the Services Locally

### 1. Database (PostgreSQL via Docker)

Start the local PostgreSQL container:
```bash
docker compose up -d
```
To check container status:
```bash
docker compose ps
```
To stop the database:
```bash
docker compose down
```

---

### 2. Backend (FastAPI)

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     py -3 -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
5. Verify the health check:
   - Health endpoint: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) (returns `{"status": "ok"}`)
   - Interactive Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc documentation: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 3. Frontend (Next.js)

1. Open a terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at [http://localhost:3000](http://localhost:3000).

---

## Database Migrations (Alembic)

Once models are defined in `app/models/`, generate and run migrations from the `backend/` directory:

```bash
# Generate a new migration
alembic revision --autogenerate -m "create_initial_tables"

# Apply pending migrations
alembic upgrade head
```
