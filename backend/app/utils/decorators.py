from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from ..models.user import User, UserRole


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({'success': False, 'message': 'User not found'}), 404
            
            if not user.is_active:
                return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
            
            if user.role not in [UserRole(r) for r in roles]:
                return jsonify({'success': False, 'message': 'Permission denied'}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def admin_required(fn):
    return role_required('admin')(fn)


def counselor_required(fn):
    return role_required('counselor', 'admin')(fn)


def client_required(fn):
    return role_required('client')(fn)
