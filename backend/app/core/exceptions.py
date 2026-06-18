from fastapi import status as http_status


class WorkflowException(Exception):
    """Base exception for all domain-specific errors in the workflow system."""

    def __init__(self, detail: str, status_code: int = http_status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


class NotFoundException(WorkflowException):
    """Raised when a requested resource cannot be found."""

    def __init__(self, detail: str = "Resource not found."):
        super().__init__(detail=detail, status_code=http_status.HTTP_404_NOT_FOUND)


class UnauthorizedException(WorkflowException):
    """Raised when the request lacks valid authentication credentials."""

    def __init__(self, detail: str = "Authentication required."):
        super().__init__(detail=detail, status_code=http_status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(WorkflowException):
    """Raised when an authenticated user does not have permission to perform an action."""

    def __init__(self, detail: str = "You do not have permission to perform this action."):
        super().__init__(detail=detail, status_code=http_status.HTTP_403_FORBIDDEN)


class ValidationException(WorkflowException):
    """Raised when submitted data fails business-level validation."""

    def __init__(self, detail: str = "Validation error."):
        super().__init__(detail=detail, status_code=422)


class ConflictException(WorkflowException):
    """Raised when an operation conflicts with the current resource state."""

    def __init__(self, detail: str = "Resource conflict."):
        super().__init__(detail=detail, status_code=http_status.HTTP_409_CONFLICT)
