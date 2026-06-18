import logging
import sys
from app.core.config import settings
from app.core.logging_context import get_request_id

class RequestIdFilter(logging.Filter):
    """
    Logging filter injecting the current context-specific request_id.
    """
    def filter(self, record):
        record.request_id = get_request_id() or "-"
        return True

def setup_logging():
    log_format = "%(asctime)s - %(name)s - %(levelname)s - [request_id=%(request_id)s] - %(message)s"
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Clear existing handlers
    logger.handlers = []
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(log_format))
    handler.addFilter(RequestIdFilter())
    
    logger.addHandler(handler)