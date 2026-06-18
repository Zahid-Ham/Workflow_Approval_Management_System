from enum import Enum

class UserRole(str, Enum):
    REQUESTER = 'Requester'
    REVIEWER = 'Reviewer'


class RequestPriority(str, Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'


class RequestStatus(str, Enum):
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'


class ReviewActionType(str, Enum):
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
