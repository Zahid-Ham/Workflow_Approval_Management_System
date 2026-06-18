# Google OAuth 2.0 Sequence Diagram

This sequence diagram outlines the interaction flow during the authentication lifecycle:

```mermaid
sequenceDiagram
    autonumber
    actor User as User Agent
    participant FE as React Frontend
    participant BE as FastAPI Backend
    participant AuthSvc as AuthService
    participant OAuthSvc as OAuthService
    participant JWTSvc as JWTService
    participant UserRepo as UserRepository
    participant Google as Google Auth API

    User->>FE: Click "Login with Google"
    FE->>BE: GET /auth/google/login
    BE->>AuthSvc: get_google_login_url()
    AuthSvc->>OAuthSvc: get_authorization_url()
    OAuthSvc-->>BE: Redirect Location (https://accounts.google.com/...)
    BE-->>FE: Return Redirect URI
    FE->>User: Redirect browser window

    User->>Google: Authenticate & Authorize Request
    Google-->>FE: HTTP Redirect to Frontend callback with code=AUTHORIZATION_CODE

    FE->>BE: GET /auth/google/callback?code=AUTHORIZATION_CODE
    BE->>AuthSvc: authenticate_google_user(code)
    
    AuthSvc->>OAuthSvc: get_google_user_profile(code)
    OAuthSvc->>Google: Exchange Auth Code for Profile Details
    Google-->>OAuthSvc: Return openid attributes (sub, email, name)
    OAuthSvc-->>AuthSvc: Profile metadata dict

    AuthSvc->>UserRepo: get_by_google_id(sub)
    alt User is new
        UserRepo-->>AuthSvc: None
        AuthSvc->>UserRepo: create(name, email, sub, role="Requester")
        UserRepo-->>AuthSvc: User record
    else User exists
        UserRepo-->>AuthSvc: User record
    end

    AuthSvc->>JWTSvc: create_token(payload_claims)
    JWTSvc-->>AuthSvc: Signed JWT Session Token
    AuthSvc-->>BE: JWT Session Token
    BE-->>FE: Return Access Token JSON Response
    FE->>FE: Store JWT in LocalStorage
    FE->>User: Redirect to dashboard view with authenticated context
```

## Description of Responsibilities

1. **`OAuthService`**: Handles low-level outbound network HTTP requests to Google APIs (redirect location generation, exchanging codes, and fetching user profiles).
2. **`UserRepository`**: Manages queries and persistence operations for User models in the PostgreSQL database.
3. **`JWTService`**: Handles encoding, signing, and verification operations for secure JSON Web Tokens.
