# Database ER Diagram

The database uses PostgreSQL with the following relations:

```mermaid
erDiagram
    users {
        uuid id PK
        string name
        string email UK
        string google_id UK
        string role "Requester | Reviewer"
        timestamp created_at
    }

    approval_requests {
        uuid id PK
        string title
        text description
        string priority "LOW | MEDIUM | HIGH"
        string status "PENDING | APPROVED | REJECTED"
        uuid created_by FK
        uuid reviewer_id FK
        timestamp created_at
        timestamp updated_at
    }

    review_actions {
        uuid id PK
        uuid request_id FK
        string action "APPROVED | REJECTED"
        text comments
        uuid reviewed_by FK
        timestamp reviewed_at
    }

    users ||--o{ approval_requests : "creates"
    users ||--o{ approval_requests : "reviews"
    approval_requests ||--o{ review_actions : "has"
    users ||--o{ review_actions : "performs"
```

## Description of Entities

### 1. `users`
- Stores user profiles populated from Google accounts upon first successful login.
- **`role`**: Enforces system permissions. A user is designated either as a `Requester` (can manage own requests) or a `Reviewer` (can approve/reject assigned requests).

### 2. `approval_requests`
- Core entity tracking request details, urgency (`priority`), and current state (`status`).
- **`created_by`**: Foreign key pointing to the user who created it (must be a `Requester`).
- **`reviewer_id`**: Foreign key pointing to the assigned user responsible for reviews (must be a `Reviewer`).

### 3. `review_actions`
- Audit trail logging historical reviewer responses.
- Every review decision creates a corresponding record here capturing action types and comments.
