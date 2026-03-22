import random
import string
from datetime import datetime, timedelta


class AuthService:
    """OTP-based authentication service for password reset."""
    
    # In-memory OTP storage: { email: { otp, user_id, expires, attempts } }
    otp_store = {}
    
    # Rate limiting: { email: last_sent_at }
    rate_limit = {}
    
    @staticmethod
    def generate_otp(user_id: int, email: str) -> str:
        """
        Generate a 6-digit OTP for the given user.
        
        Args:
            user_id: The user's database ID
            email: The user's email address
            
        Returns:
            The generated 6-digit OTP string
        """
        # Rate limiting: prevent sending more than 1 OTP per 60 seconds
        if email in AuthService.rate_limit:
            time_since = datetime.utcnow() - AuthService.rate_limit[email]
            if time_since.total_seconds() < 60:
                return None  # Rate limited
        
        # Generate 6-digit OTP
        otp = ''.join(random.choices(string.digits, k=6))
        
        # Store OTP with metadata
        AuthService.otp_store[email] = {
            'otp': otp,
            'user_id': user_id,
            'expires': datetime.utcnow() + timedelta(minutes=10),
            'attempts': 0  # Track failed verification attempts
        }
        
        # Update rate limit
        AuthService.rate_limit[email] = datetime.utcnow()
        
        return otp
    
    @staticmethod
    def validate_otp(email: str, otp_code: str) -> int:
        """
        Validate an OTP code for the given email.
        
        Args:
            email: The user's email address
            otp_code: The 6-digit OTP to validate
            
        Returns:
            user_id if valid, None otherwise
        """
        data = AuthService.otp_store.get(email)
        
        if not data:
            return None
        
        # Check if expired
        if datetime.utcnow() > data['expires']:
            del AuthService.otp_store[email]
            return None
        
        # Check max attempts (5 attempts max)
        if data['attempts'] >= 5:
            del AuthService.otp_store[email]
            return None
        
        # Increment attempt counter
        data['attempts'] += 1
        
        # Validate OTP
        if otp_code != data['otp']:
            return None
        
        return data['user_id']
    
    @staticmethod
    def invalidate_otp(email: str) -> None:
        """Remove OTP after successful password reset."""
        if email in AuthService.otp_store:
            del AuthService.otp_store[email]
    
    @staticmethod
    def can_resend(email: str) -> tuple:
        """
        Check if OTP can be resent (rate limiting).
        
        Returns:
            (can_resend: bool, seconds_remaining: int)
        """
        if email not in AuthService.rate_limit:
            return True, 0
        
        time_since = datetime.utcnow() - AuthService.rate_limit[email]
        seconds_passed = int(time_since.total_seconds())
        
        if seconds_passed >= 60:
            return True, 0
        
        return False, 60 - seconds_passed
