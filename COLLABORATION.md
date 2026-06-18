# Collaboration & Production Deployment Guide

This guide highlights the key development assumptions, known system limitations, and recommended strategies for production release and horizontal scaling.

---

## 1. Development Assumptions
During implementation, the following architectural assumptions were made:
- **Email Uniqueness**: User emails are unique across Google's directory. If a user logs in via Google OAuth and their email matches an existing database record, they are merged.
- **Reviewer Exclusivity**: Requesters cannot approve their own requests. The request creation validation enforces that a reviewer must be a separate user assigned to the request.
- **Pending Mutability**: Requests are only mutable (editable or deletable) while their status is `PENDING`. Once approved or rejected, requests are locked to preserve audit history integrity.

---

## 2. Known Limitations
- **Single-Node Rate Limiting**: The rate-limiting configuration is stored in-memory. Under horizontal scaling (multiple container instances), rate limits are tracked per instance instead of globally.
- **Static Reviewer List**: The frontend fetches all users with the role `Reviewer`. In very large enterprises, a paginated search-as-you-type list is necessary rather than loading all reviewers in a single dropdown.
- **Role Elevation**: There is no self-service user management screen to promote a `Requester` to a `Reviewer` role. This must be managed by database administrators.

---

## 3. Production Deployment Changes
When preparing to transition this system to a production environment, complete the following steps:

### Backend Updates
- **WSGI / ASGI Server**: Replace the reload-mode Uvicorn server with a Gunicorn runner executing multiple Uvicorn worker threads:
  ```bash
  gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
  ```
- **Real Database Connection**: Configure `DATABASE_URL` to point to a production-grade PostgreSQL cluster with connection pooling enabled.
- **HTTPS Enforcement**: Ensure all traffic is served over TLS (HTTPS). Configure a reverse proxy like Nginx or AWS ALB to handle SSL termination.
- **Environment Secrets**: Secure all sensitive values (`GOOGLE_CLIENT_SECRET`, `JWT_SECRET`) in a secret manager or environment configuration (e.g., HashiCorp Vault, AWS Secrets Manager).

### Frontend Updates
- **API Target**: Update `VITE_API_URL` to point to the production API domain instead of `localhost`.
- **Production Build**: Generate optimized assets using `npm run build` and host them on a secure static server (e.g., Nginx, AWS S3 with CloudFront).
- **Strict Headers**: Serve frontend files with secure headers (`Content-Security-Policy`, `Strict-Transport-Security`).

### Database & Scaling Updates
- **Connection Pools**: Configure SQLAlchemy's pool size and max overflow parameters to match expected connection concurrency.
- **Database Migrations**: Run schema upgrades systematically in the deployment pipeline using Alembic migrations.
- **Distributed Rate Limiting**: Migrate the memory-based rate limiter to a shared storage database like Redis to support multi-node scaling.
