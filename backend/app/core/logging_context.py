import contextvars
from typing import Optional
request_id_ctx: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar('request_id', default = None)

def get_request_id():
    '''Retrieve the current request ID from context.'''
    return request_id_ctx.get()


def set_request_id(request_id = None):
    '''Assign a request ID to the current context.'''
    request_id_ctx.set(request_id)
