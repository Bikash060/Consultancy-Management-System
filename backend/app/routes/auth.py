from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token, 
    jwt_required, get_jwt_identity
)
from ..extensions import db
from ..models.user import User, Profile
from ..utils.validators import validate_email, validate_password
from ..services.auth_service import AuthService
from ..services.email_service import EmailService

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    phone = data.get('phone', '').strip()
    
    if not email or not password or not first_name or not last_name:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    if not validate_email(email):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    
    is_valid, error_msg = validate_password(password)
    if not is_valid:
        return jsonify({'success': False, 'message': error_msg}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409
    
    user = User(email=email, phone=phone if phone else None)
    user.set_password(password)
    
    profile = Profile(
        user=user,
        first_name=first_name,
        last_name=last_name
    )
    
    db.session.add(user)
    db.session.add(profile)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()  # This is now a string
    access_token = create_access_token(identity=str(user_id))  # Keep as string
    return jsonify({'success': True, 'access_token': access_token})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()  # This is now a string
    user = User.query.get(int(user_id))  # Convert to int for DB lookup
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    return jsonify({'success': True, 'user': user.to_dict()})


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send a 6-digit OTP to the user's email for password reset."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    if not validate_email(email):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if user:
        # Check rate limiting
        can_send, seconds_left = AuthService.can_resend(email)
        if not can_send:
            return jsonify({
                'success': False, 
                'message': f'Please wait {seconds_left} seconds before requesting a new OTP'
            }), 429
        
        # Generate OTP
        otp = AuthService.generate_otp(user.id, email)
        
        if otp:
            # Send OTP via email
            email_sent = EmailService.send_password_reset_otp(email, otp)
            if not email_sent:
                print(f"Failed to send OTP email to {email}")
    
    # Always return success to prevent email enumeration
    return jsonify({
        'success': True, 
        'message': 'If an account exists with this email, an OTP has been sent.'
    })


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify the OTP code submitted by the user."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()
    
    if not email or not otp:
        return jsonify({'success': False, 'message': 'Email and OTP are required'}), 400
    
    if len(otp) != 6 or not otp.isdigit():
        return jsonify({'success': False, 'message': 'OTP must be a 6-digit number'}), 400
    
    user_id = AuthService.validate_otp(email, otp)
    
    if not user_id:
        return jsonify({'success': False, 'message': 'Invalid or expired OTP'}), 400
    
    return jsonify({
        'success': True, 
        'message': 'OTP verified successfully'
    })


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset the user's password after OTP verification."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()
    new_password = data.get('password', '')
    
    if not email or not otp or not new_password:
        return jsonify({'success': False, 'message': 'Email, OTP, and new password are required'}), 400
    
    # Validate the new password
    is_valid, error_msg = validate_password(new_password)
    if not is_valid:
        return jsonify({'success': False, 'message': error_msg}), 400
    
    # Validate OTP again
    user_id = AuthService.validate_otp(email, otp)
    
    if not user_id:
        return jsonify({'success': False, 'message': 'Invalid or expired OTP'}), 400
    
    # Find user and reset password
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    user.set_password(new_password)
    db.session.commit()
    
    # Invalidate the OTP after successful reset
    AuthService.invalidate_otp(email)
    
    return jsonify({
        'success': True, 
        'message': 'Password reset successful. You can now log in with your new password.'
    })
