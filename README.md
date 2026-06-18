# Workflow Approval Management System

A production-grade, secure, role-based approval workflow platform designed for modern business operations.

## Architecture

This project is organized into two primary applications:
1. **Backend**: Built with **FastAPI**, **SQLAlchemy ORM**, and **PostgreSQL**.
2. **Frontend**: Built with **React.js**, **Vite**, **React Router**, and **Axios**.

### Project Structure
```text
.
├── backend/
│   ├── app/
│   │   ├── api/            # API Route endpoints & route definitions
│   │   ├── models/         # SQLAlchemy ORM models (User, Request, Action)
│   │   ├── schemas/        # Pydantic schemas for validation/serialization
│   │   ├── services/       # Core business logic layer
│   │   ├── repositories/   # Repository pattern implementations for DB access
│   │   ├── core/           # Security, OAuth setup, global config
│   │   └── database/       # DB session management and engine setup
│   ├── tests/              # Pytest suites
│   └── main.py             # FastAPI entry point
│
└── frontend/
    ├── src/
    │   ├── api/            # Axios API client setup and interceptors
    │   ├── components/     # Reusable, atomic UI components
    │   ├── pages/          # Full page views (Login, Requester/Reviewer Dashboards)
    │   ├── routes/         # Routing configurations and Route guards
    │   ├── hooks/          # Custom React hooks (useAuth, useRequests)
    │   ├── services/       # Service layer mapping API requests
    │   ├── context/        # Auth and global state contexts
    │   ├── utils/          # Formatting and utility functions
    │   └── tests/          # React Testing Library suites
    ├── package.json
    └── vite.config.js
```

## Setup & Running Instructions

This repository contains a quick launch automation script `run_dev.bat` for Windows developers.

### Quick Setup

1. **Initialize the Environment**:
   Run the following command to create a Python virtual environment, install backend packages, and install npm modules:
   ```bash
   run_dev.bat setup
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure your local Postgres database details along with your Google OAuth 2.0 keys:
   ```bash
   cp .env.example .env
   ```

3. **Apply Migrations and Seed Database**:
   Apply Alembic migrations to create database tables and run the seed script to generate mock users and requests:
   ```bash
   cd backend
   # Apply migrations
   .venv\Scripts\alembic upgrade head
   # Populate database
   .venv\Scripts\python scripts/seed_data.py
   cd ..
   ```

4. **Start Development Servers**:
   Launch both backend and frontend servers in separate terminals simultaneously:
   ```bash
   run_dev.bat
   ```

### Individual Service Setup

#### Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API Docs will be available at `http://localhost:8000/docs`
- Run Backend tests: `pytest`

#### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Frontend will be available at `http://localhost:5173`
- Format and lint: `npm run format` and `npm run lint`
- Run Frontend tests: `npm run test`

