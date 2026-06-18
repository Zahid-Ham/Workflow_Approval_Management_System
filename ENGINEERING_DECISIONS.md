# Engineering Decisions

This document outlines the architectural patterns, security validations, and design tradeoffs chosen for the **Workflow Approval Management System**.

---

## 1. Architectural Rationale
The backend architecture splits operations into logical layers to isolate dependencies:
```
FastAPI Endpoints (API) -> Business Logic (Services) -> Database Execution (Repositories) -> SQLAlchemy Models
```
- **Separation of Concerns**: The API layer only handles request parsing, HTTP status codes, and JSON serialization. Business logic rules (such as validating state transitions and verifying matching reviewer IDs) live in pure python files inside `app/services`.
- **Statelessness**: The FastAPI application is designed to be fully stateless, storing session data inside signed JSON Web Tokens (JWT) client-side. This layout supports easy vertical/horizontal scaling behind an API Gateway or Load Balancer.

---

## 2. Repository Pattern Rationale
Rather than making direct ORM queries inside endpoints or services, database interactions are encapsulated inside specialized Repositories (`UserRepository`, `RequestRepository`, `ReviewRepository`):
- **Mockability**: Services can be unit-tested efficiently by supplying mock repository instances rather than running a live database engine.
- **ORM Independence**: The repository interface encapsulates database-specific semantics (e.g. eager loads `selectinload` mappings). If SQLAlchemy is swapped for another driver (like Tortoise ORM or raw asyncpg), the service layer logic remains completely untouched.

---

## 3. Authentication & OAuth Decisions
- **Google OAuth 2.0 Identity Providers**: Decided to use Google SSO as the primary registration and login mechanism. This removes the risk of handling and storing hashed user passwords, reducing the attack surface.
registered under the default 'Requester' role. If the email exists, the profile is resolved, and a signed JWT session token is issued containing their identifier and role.

---

## 4. Security & Data Integrity Tradeoffs
- **Input Sanitization**: To protect against stored XSS, all request titles, descriptions, and comments are sanitized (escaping HTML tags and stripping whitespace) at the Pydantic schema validation layer before hitting the database.
- **Database Mappings**: Added database indexes to timestamp sorting columns (`created_at`) on the Request tables, maximizing query speed on dashboard feeds.
- **Immutable States**: Enforced absolute state boundaries preventing modification of requests that are already `APPROVED` or `REJECTED` by the reviewer, protecting the integrity of business approvals.
