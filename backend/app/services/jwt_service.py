from typing import Optional
from app.core.security import create_access_token, verify_access_token

class JWTService:
    '''
    Service wrapping core JWT token signatures generation and verification.
    '''
    
    def __init__(self):
        pass

    
    def create_token(self = None, payload_claims = None):
        '''Sign custom token using core security helpers.'''
        return create_access_token(payload_claims)

    
    def decode_token(self = None, token = None):
        '''Decode custom token using core security helpers.'''
        return verify_access_token(token)

