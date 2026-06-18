# Database Migrations Documentation

This repository tracks database schemas using **Alembic**.

## Alembic Migration Commands

Use the following commands inside the `backend` directory (with virtual environment activated) to manage schemas:

### 1. Generating Auto-generated Migrations
Generates a new migration version file containing automatic detections of SQLAlchemy models updates:
```bash
alembic revision --autogenerate -m "description of changes"
```

### 2. Applying Migrations (Upgrade)
Applies pending schema migrations to the active database context up to the latest version:
```bash
alembic upgrade head
```

### 3. Reverting Migrations (Downgrade)
Rolls back schema modifications to a previous version or completely drops all schemas:
```bash
alembic downgrade base
```

---

## Initial Version Details (`001_initial`)
The initial migration script defines three core tables:
1. **`users`**: Stores user authentication profiles with unique constraints on emails and Google identifiers.
2. **`approval_requests`**: Holds request documents (priority level, current workflow state), linking to the creator requester and reviewer assignee.
3. **`review_actions`**: Captures decision logs, comments, and reviewer signatures.
