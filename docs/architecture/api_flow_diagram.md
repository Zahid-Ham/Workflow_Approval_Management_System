# API Flow Diagram

The backend follows Clean Architecture where requests traverse downwards from the API controller, through services and repositories, to the database.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client Browser
    participant API as API Layer (FastAPI Routers)
    participant Dep as Dependency Injection (session/auth)
    participant Svc as Service Layer (Business Rules)
    participant Repo as Repository Layer (Queries)
    participant DB as Database (PostgreSQL)

    Client->>API: HTTP Request (e.g., POST /requests) with JWT
    API->>Dep: Validate JWT and Extract Session User
    Dep-->>API: Returns Current User (Context)
    
    API->>API: Validate Request Schema (Pydantic)
    API->>Svc: Invoke Operation (e.g., create_request(payload, user))
    
    Svc->>Svc: Enforce Rules (Role checks, business validation)
    Svc->>Repo: Fetch/Write Entities
    Repo->>DB: Execute SQL Async Query
    DB-->>Repo: Return Row Data
    Repo-->>Svc: Return SQLAlchemy Object Model
    
    Svc-->>API: Return Result Model / Throw HTTP Exception
    API-->>Client: Serialize Response (Pydantic Output)
```

## Layers Breakdown

1. **Client Browser**: Makes asynchronous Axios requests, attaching the JWT bearer token to header requests.
2. **API Layer**: Exposes routes, defines dependencies, parses JSON, and catches HTTP/Validation errors.
3. **Dependency Injection**: Resolves DB session contexts and extracts/verifies user authorization roles.
4. **Service Layer**: Evaluates business constraints (e.g., "Only owners can modify a PENDING request").
5. **Repository Layer**: Encapsulates raw database queries behind simple clean APIs.
6. **Database**: PostgreSQL processing data transactions.
