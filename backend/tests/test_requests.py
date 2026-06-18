import pytest

def test_create_request_success():
    """
    Test that a requester can create a PENDING request.
    """
    pass

def test_create_request_invalid_role():
    """
    Test that a reviewer cannot create requests.
    """
    pass

def test_update_request_non_pending():
    """
    Test that editing is blocked once the request status is no longer PENDING.
    """
    pass

def test_delete_request_ownership():
    """
    Test that a requester cannot delete another requester's request.
    """
    pass
