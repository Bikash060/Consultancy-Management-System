import re


def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    pattern = r'^\+?[0-9]{10,15}$'
    return bool(re.match(pattern, phone))


def validate_password(password: str) -> tuple:
    if len(password) < 8:
        return False, 'Password must be at least 8 characters'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain an uppercase letter'
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain a lowercase letter'
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain a number'
    return True, None
