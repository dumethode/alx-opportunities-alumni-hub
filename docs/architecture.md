# Architecture

The system is organized as a monorepo with a separate Next.js frontend and FastAPI backend.

- Frontend owns presentation, route gating, search UX, and dashboards.
- Backend owns auth, persistence, admin CRUD, analytics counters, and document generation.
- The database is PostgreSQL-ready, with SQLite enabled for local development fallback.

