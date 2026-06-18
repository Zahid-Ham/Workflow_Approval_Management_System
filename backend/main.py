import logging
import uvicorn
import uuid
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import WorkflowException
from app.core.logging_context import set_request_id
from app.database.session import get_db
from app.api.auth import router as auth_router
from app.api.requests import router as requests_router
from app.api.reviewer import router as reviewer_router
from app.api.seed import router as seed_router

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title='Workflow Approval Management System',
    description='API for managing approval workflows, users, and actions.',
    version='1.0.0'
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# Middleware for request tracing
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    set_request_id(request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Exception handlers
@app.exception_handler(WorkflowException)
async def workflow_exception_handler(request: Request, exc: WorkflowException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

@app.exception_handler(ResponseValidationError)
async def response_validation_exception_handler(request: Request, exc: ResponseValidationError):
    logger.error(f"ResponseValidationError: {exc.errors()}", exc_info=False)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error: Response Validation Failed", "errors": exc.errors()}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Endpoints
app.include_router(auth_router)
app.include_router(requests_router)
app.include_router(reviewer_router)
app.include_router(seed_router)

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Service health check endpoint.
    """
    return {"status": "healthy"}

@app.get("/ready", tags=["Health"])
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Database connection readiness check.
    """
    try:
        await db.execute(select(1))
        return {"status": "ready"}
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=503, detail="Database connection failed")

if __name__ == '__main__':
    uvicorn.run('main:app', host=settings.HOST, port=settings.PORT, reload=True)