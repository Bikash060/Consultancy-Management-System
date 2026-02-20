import secrets
from datetime import datetime, timedelta


class AuthService:
    reset_tokens = {}
    
    @staticmethod
    def generate_reset_token(user_id: int) -> str:
        token = secrets.token_urlsafe(32)
        AuthService.reset_tokens[token] = {
            'user_id': user_id,
            'expires': datetime.utcnow() + timedelta(hours=1)
        }
        return token
    
    @staticmethod
    def validate_reset_token(token: str) -> int:
        data = AuthService.reset_tokens.get(token)
        if not data:
            return None
        if datetime.utcnow() > data['expires']:
            del AuthService.reset_tokens[token]
            return None
        return data['user_id']
    
    @staticmethod
    def invalidate_token(token: str) -> None:
        if token in AuthService.reset_tokens:
            del AuthService.reset_tokens[token]
