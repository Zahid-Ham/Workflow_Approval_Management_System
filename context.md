# Workflow Approval Management System - Project Context

This file serves as the source of truth for the requirements, design principles, and guidelines of the **Workflow Approval Management System** project.

## Project Overview
A platform where users submit approval requests and designated reviewers act on them. This lightweight internal tool mirrors how real businesses handle approvals — expense sign-offs, leave requests, content reviews, and so on.

## Technology Stack
- **Backend:** Python 3.x, FastAPI, SQLAlchemy ORM, PostgreSQL
- **Frontend:** React.js, Vite, React Router, Axios
- **Authentication:** Google OAuth 2.0 Only (JWT-based session management, no email/password login allowed)

## User Roles

### 1. Requester
- Log in via Google
- Create, edit, view, and delete their own requests
- Track current request status

### 2. Reviewer
- Log in via Google
- View requests assigned to them
- Approve or reject requests
- Leave comments explaining their decision

## System Data Model

### User
- `id`: UUID or Integer (Primary Key)
- `name`: String (from Google profile)
- `email`: String (from Google profile)
- `google_id`: String (OAuth identifier)
- `role`: Requester | Reviewer (User type)
- `created_at`: Timestamp (Auto-generated)

### Approval Request
- `id`: UUID or Integer (Primary Key)
- `title`: String (Short description)
- `description`: Text (Full details)
- `priority`: LOW | MEDIUM | HIGH (Request urgency)
- `status`: PENDING | APPROVED | REJECTED (Current state)
- `created_by`: FK → User (Requester)
- `reviewer_id`: FK → User (Assigned reviewer)
- `created_at` / `updated_at`: Timestamps (Auto-managed)

### Review Action
- `id`: UUID or Integer (Primary Key)
- `request_id`: FK → Approval Request (Associated request)
- `action`: APPROVED | REJECTED (Decision taken)
- `comments`: Text (Reviewer notes)
- `reviewed_by`: FK → User (Reviewer)
- `reviewed_at`: Timestamp (Decision time)

## API Endpoints

### Auth
- `GET /auth/google/login`
- `GET /auth/google/callback`
- `GET /auth/me`

### Requests (Requester)
- `POST /requests`
- `GET /requests`
- `GET /requests/{id}`
- `PUT /requests/{id}`
- `DELETE /requests/{id}`

### Reviewer
- `GET /reviewer/requests`
- `POST /reviewer/requests/{id}/approve`
- `POST /reviewer/requests/{id}/reject`

## Architecture Requirements

### Backend Structure
```text
backend/
├── app/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── core/
│   └── database/
├── tests/
└── main.py
```

### Frontend Structure
```text
src/
├── api/
├── components/
├── pages/
├── routes/
├── hooks/
├── services/
├── context/
├── utils/
└── tests/
```

## Non-Functional Requirements
- Type hints on all functions and variables
- Pydantic validation for request/response bodies
- Dependency Injection for services and DB sessions
- Repository Pattern for database decoupling
- Clean Architecture principles
- Reusable React components
- Proper centralized error handling with HTTP status codes
- Environment variables for all configuration and secrets
- Unit Testing (Pytest for backend, React Testing Library for frontend)
- Maintainable and clean codebase adhering to SOLID principles
