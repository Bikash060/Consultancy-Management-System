from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User, Profile
from ..utils.decorators import admin_required

users_bp = Blueprint('users', __name__)


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
        profile = Profile(user_id=user.id)
        db.session.add(profile)
    
    if 'phone' in data:
        user.phone = data['phone']
    
    profile_fields = [
        'first_name', 'last_name', 'date_of_birth', 'address',
        'education_background', 'preferred_country', 'preferred_course',
        'budget', 'passport_number'
    ]
    
    for field in profile_fields:
        if field in data:
            setattr(profile, field, data[field])
    
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
        from ..models.application import Application
        client_ids = db.session.query(Application.client_id).filter_by(counselor_id=user_id).distinct()
        clients = User.query.filter(User.id.in_(client_ids)).all()
    else:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    return jsonify({
        'success': True,
        'clients': [c.to_dict() for c in clients]
    })
