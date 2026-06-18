# System Walkthrough & Onboarding Guide

Welcome to the team! This document serves as your onboarding companion, designed to walk you through the codebase, architectural layers, lifecycles, and testing strategies of the **Workflow Approval Management System**.

---

## 1. Request Lifecycle
A request is the central entity in this application. Its lifecycle is strictly modeled as a state machine:

```
[Draft/New] ---> (PENDING) ---> [Reviewer Action] ---> (APPROVED) or (REJECTED)
```

### Step-by-Step Flow:
1. **Creation**: A user with the `Requester` role submits a request via the frontend form (`RequestForm`). Pydantic schemas validate field boundaries and sanitizers strip HTML tags. The request is persisted in the database with status `PENDING`.
2. **Review Assignment**: When creating/editing a request, the requester assigns a user with the `Reviewer` role.
3. **Queue Listing**: The assigned reviewer logs in. Their dashboard fetches requests matching their user ID (`reviewer_id`) with status `PENDING`.
4. **Decision (Approval or Rejection)**:
   - The reviewer submits a decision (via the Decision Modal) alongside required comments.
   - The system changes the status to `APPROVED` or `REJECTED` and registers a `ReviewAction` log entry in the audit table.
5. **Locks**: Once a request is moved out of `PENDING`, the service layer blocks all edits or deletions to ensure audit trail immutability.

---

## 2. Authentication Lifecycle
Authentication is managed via Google OAuth 2.0 and JWT session tokens:

```
User logs in (Google OAuth)
   │
   ├──> OAuth callback endpoint (/auth/callback)
   │       │
   │       ├──> Fetch profile from Google API
   │       ├──> Look up user in DB (email/google_id)
   │       │       ├──> Found: Merge profile / update google_id
   │       │       └──> Not Found: Auto-onboard with role "Requester"
   │       │
   │       └──> Generate stateless JWT Token (Signed with HMAC-SHA256)
   │
   └──> Client receives JWT, saves to localStorage, and appends as 'Bearer <token>'

---

## 3. Directory Layout & Module Structure
- **`backend/`**: Contains the FastAPI server, SQLite session pool, logging tracing context, and database schema controllers.
  - `app/api/`: Request mapping routers (`auth.py`, `requests.py`, `reviewer.py`).
  - `app/services/`: Pure business logic boundary layer.
  - `app/repositories/`: Encapsulated SQLAlchemy database operators.
  - `app/schemas/`: Pydantic data schemas and sanitizers.
- **`frontend/`**: Contains the React Vite single-page application.
  - `src/context/`: `AuthContext.jsx` authentication status context.
  - `src/components/`: Reusable interface elements (`Requests/`, `Dashboard/`).
  - `src/pages/`: Full dashboard routes and detail views.
  - `src/tests/`: High-fidelity Vitest mock tests.

---

## 4. Verification Controls
- **Backend Testing**: Run Pytest suite with `pytest`.
- **Frontend Testing**: Run Vitest suite with `npm run test:run` in the `frontend` directory.
