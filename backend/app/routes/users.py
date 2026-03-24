from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User, Profile
from ..utils.decorators import admin_required

users_bp = Blueprint('users', __name__)

ALL_PROFILE_FIELDS = [
    'first_name', 'last_name', 'date_of_birth', 'address',
    'education_background', 'preferred_country', 'preferred_course',
    'budget', 'passport_number',
    # Onboarding fields
    'father_name', 'mother_name', 'parent_phone', 'parent_email',
    'city', 'state', 'zip_code', 'country_of_residence',
    'neb_gpa', 'neb_stream', 'neb_year', 'neb_school',
    'bachelors_university', 'bachelors_course', 'bachelors_gpa',
    'english_test_type', 'english_test_score',
    'interests', 'career_goals',
    'gender', 'nationality', 'marital_status',
]


@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    return jsonify({'success': True, 'user': user.to_dict()})


@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id, first_name=data.get('first_name', ''), last_name=data.get('last_name', ''))
        db.session.add(profile)
    
    if 'phone' in data:
        user.phone = data['phone']
    
    for field in ALL_PROFILE_FIELDS:
        if field in data:
            value = data[field]
            # Handle budget as numeric
            if field == 'budget' and value:
                try:
                    value = float(str(value).replace(',', ''))
                except (ValueError, TypeError):
                    value = None
            setattr(profile, field, value if value != '' else None)
    
    db.session.commit()
    
    return jsonify({'success': True, 'user': user.to_dict()})


@users_bp.route('/onboarding', methods=['POST'])
@jwt_required()
def complete_onboarding():
    """Complete the onboarding wizard — saves all profile fields and marks profile_setup=True."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()

    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()

    if not first_name or not last_name:
        return jsonify({'success': False, 'error': 'First name and last name are required'}), 400

    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id, first_name=first_name, last_name=last_name)
        db.session.add(profile)

    if 'phone' in data and data['phone']:
        user.phone = data['phone']

    for field in ALL_PROFILE_FIELDS:
        if field in data:
            value = data[field]
            if field == 'budget' and value:
                try:
                    value = float(str(value).replace(',', ''))
                except (ValueError, TypeError):
                    value = None
            setattr(profile, field, value if value != '' else None)

    # Handle counselor assignment (required)
    counselor_id = data.get('counselor_id')
    if not counselor_id:
        return jsonify({'success': False, 'error': 'Please select a counselor to continue'}), 400
    try:
        counselor_id = int(counselor_id)
        from ..models.user import UserRole as UR
        counselor = User.query.filter_by(id=counselor_id, role=UR.COUNSELOR, is_active=True).first()
        if not counselor:
            return jsonify({'success': False, 'error': 'Selected counselor is not available'}), 400
        user.assigned_counselor_id = counselor_id
    except (ValueError, TypeError):
        return jsonify({'success': False, 'error': 'Invalid counselor selected'}), 400

    user.profile_setup = True
    db.session.commit()

    return jsonify({'success': True, 'user': user.to_dict()})


@users_bp.route('/counselors', methods=['GET'])
@jwt_required()
def get_counselors():
    from ..models.user import UserRole
    counselors = User.query.filter_by(role=UserRole.COUNSELOR, is_active=True).all()
    return jsonify({
        'success': True,
        'counselors': [c.to_dict() for c in counselors]
    })


@users_bp.route('/clients', methods=['GET'])
@jwt_required()
def get_clients():
    from ..models.user import UserRole
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role == UserRole.ADMIN:
        clients = User.query.filter_by(role=UserRole.CLIENT).all()
    elif user.role == UserRole.COUNSELOR:
        # Show only clients who selected this counselor during onboarding
        clients = User.query.filter_by(role=UserRole.CLIENT, assigned_counselor_id=int(user_id)).all()
    else:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    return jsonify({
        'success': True,
        'clients': [c.to_dict() for c in clients]
    })
