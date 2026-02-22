from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from ..extensions import db
from ..models.user import User, UserRole
from ..models.application import Application, ApplicationStatus
from ..models.appointment import Appointment
from ..models.document import Document
from ..utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard():
    total_clients = User.query.filter_by(role=UserRole.CLIENT).count()
    total_counselors = User.query.filter_by(role=UserRole.COUNSELOR).count()
    total_applications = Application.query.count()
    
    visa_approved = Application.query.filter_by(status=ApplicationStatus.VISA_APPROVED).count()
    visa_rejected = Application.query.filter_by(status=ApplicationStatus.VISA_REJECTED).count()
    visa_total = visa_approved + visa_rejected
    visa_success_rate = (visa_approved / visa_total * 100) if visa_total > 0 else 0
    
    return jsonify({
        'success': True,
        'stats': {
            'total_clients': total_clients,
            'total_counselors': total_counselors,
            'total_applications': total_applications,
            'visa_approved': visa_approved,
            'visa_rejected': visa_rejected,
            'visa_success_rate': round(visa_success_rate, 2)
        }
    })


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    role = request.args.get('role')
    
    query = User.query
    if role:
        query = query.filter_by(role=UserRole(role))
    
    users = query.all()
    
    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in users]
    })


@admin_bp.route('/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'counselor')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 409
    
    from ..models.user import Profile
    
    user = User(email=email, role=UserRole(role))
    user.set_password(password)
    
    profile = Profile(user=user, first_name=first_name, last_name=last_name)
    
    db.session.add(user)
    db.session.add(profile)
    db.session.commit()
    
    return jsonify({'success': True, 'user': user.to_dict()}), 201


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    data = request.get_json()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'role' in data:
        user.role = UserRole(data['role'])
    
    db.session.commit()
    
    return jsonify({'success': True, 'user': user.to_dict()})


@admin_bp.route('/reports/counselor-performance', methods=['GET'])
@jwt_required()
@admin_required
def counselor_performance():
    counselors = User.query.filter_by(role=UserRole.COUNSELOR).all()
    
    report = []
    for c in counselors:
        total_apps = Application.query.filter_by(counselor_id=c.id).count()
        approved = Application.query.filter_by(
            counselor_id=c.id, 
            status=ApplicationStatus.VISA_APPROVED
        ).count()
        
        report.append({
            'counselor': c.to_dict(),
            'total_applications': total_apps,
            'visa_approved': approved,
            'success_rate': round((approved / total_apps * 100) if total_apps > 0 else 0, 2)
        })
    
    return jsonify({'success': True, 'report': report})


@admin_bp.route('/reports/country-stats', methods=['GET'])
@jwt_required()
@admin_required
def country_stats():
    stats = db.session.query(
        Application.country,
        func.count(Application.id).label('total')
    ).group_by(Application.country).all()
    
    return jsonify({
        'success': True,
        'stats': [{'country': s[0], 'count': s[1]} for s in stats]
    })
