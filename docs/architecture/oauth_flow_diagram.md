# Google OAuth 2.0 Authentication Flow

This diagram illustrates the step-by-step token exchange flow for Google OAuth 2.0 and custom JWT session management.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant FE as React Frontend
    participant BE as FastAPI Backend
    participant Google as Google OAuth Server

    User->>FE: Click "Login with Google"
    FE->>BE: GET /auth/google/login
    BE-->>FE: Return Google Authorization URL
    FE->>User: Redirect to Google Consent Page
    
    User->>Google: Authenticate & Approve permissions
    Google->>FE: Redirect to /login/callback?code=AUTH_CODE
    
    FE->>BE: GET /auth/google/callback?code=AUTH_CODE
    BE->>Google: POST exchange code for ID & Access Tokens
    Google-->>BE: Return Tokens (profile metadata)
    
    BE->>BE: Lookup or Register User profile in DB
    BE->>BE: Issue custom JWT Session Token (encoded user details + role)
    BE-->>FE: Return custom JWT Session Token
    
    FE->>FE: Store JWT in LocalStorage
    FE->>User: Redirect to Role Dashboard
```

## Security Considerations

- **Authorization Code Flow with Server-Side Exchange**: Prevents exposing the Google Client Secret to the frontend client application.
- **Stateless Session Tokens**: Custom JWT tokens contain role mapping values which are signed using the backend's `JWT_SECRET` key to block client manipulation.
