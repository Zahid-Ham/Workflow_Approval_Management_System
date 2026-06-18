# Architecture Diagram

The system follows a standard three-tier architecture with clean separation of concerns and Google OAuth 2.0-only authentication flow.

```mermaid
graph TD
    %% Frontend Components
    subgraph Frontend [React.js Vite App]
        router[React Router]
        context[AuthContext JWT state]
        pages[Pages / Dashboards]
        axios[Axios HTTP Client]
    end

    %% Backend Components
    subgraph Backend [FastAPI Application]
        api[API Controller Layer]
        services[Service Business Logic Layer]
        repos[Repository Database Layer]
        models[SQLAlchemy Database Models]
        security[JWT & Google OAuth Middleware]
    end

    %% External Systems
    subgraph External [Database & Auth Providers]
        postgres[(PostgreSQL Database)]
        google[Google OAuth API Consent Screen]
    end

    %% Interactions
    router --> pages
    pages --> context
    pages --> axios
    axios -->|Bearer JWT Header| api
    
    api --> security
    api --> services
    services --> repos
    repos --> models
    models --> postgres
    
    security -->|Validate Code / Profile| google
    context -->|Redirect to Login| google
```

### Flow Walkthrough
1. **Unauthenticated User**: Navigates to `/login` on Frontend.
2. **Google Sign-In Triggered**: User clicks "Sign in with Google", browser redirects to `google` consent screen via backend-provided URL.
3. **Authorization Code Flow**: After successful Google Sign-In, user is redirected back to Backend callback endpoint.
4. **Token Exchange**: Backend validates authorization code, exchanges it with Google APIs, gets profile details, registers/updates the user, creates a secure custom JWT, and redirects user to Frontend with the session token.
5. **App Access**: React app stores the JWT token in `localStorage`, and subsequent API calls add it to Axios `Authorization: Bearer <token>` request header, granting access to restricted endpoints based on user roles (`Requester` or `Reviewer`).
