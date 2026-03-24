from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..extensions import db
from ..models.user import User, UserRole
from ..models.application import Application, ApplicationStage, ApplicationStatus

applications_bp = Blueprint('applications', __name__)

DEFAULT_STAGES = [
    'Document Collection',
    'Application Submitted',
    'Offer Letter',
    'Visa Lodged',
    'Visa Decision'
]


@applications_bp.route('', methods=['POST'])
@jwt_required()
def create_application():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()

    country = data.get('country')
    if not country:
        return jsonify({'success': False, 'message': 'Country is required'}), 400

    # Clients create applications for themselves
    if user.role == UserRole.CLIENT:
        client_id = user.id
        # Always use the client's assigned counselor
        counselor_id = user.assigned_counselor_id or data.get('counselor_id')
    elif user.role in [UserRole.COUNSELOR, UserRole.ADMIN]:
        client_id = data.get('client_id')
        if not client_id:
            return jsonify({'success': False, 'message': 'Client is required'}), 400
        counselor_id = user.id
    else:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403

    application = Application(
        client_id=client_id,
        counselor_id=counselor_id,
        country=country,
        university=data.get('university'),
        course=data.get('course'),
        intake=data.get('intake'),
        status=ApplicationStatus.PENDING
    )

    db.session.add(application)
    db.session.flush()

    for stage_name in DEFAULT_STAGES:
        stage = ApplicationStage(
            application_id=application.id,
            stage_name=stage_name
        )
        db.session.add(stage)

    db.session.commit()

    return jsonify({
        'success': True,
        'application': application.to_dict()
    }), 201


@applications_bp.route('', methods=['GET'])
@jwt_required()
def get_applications():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    if user.role == UserRole.CLIENT:
        applications = Application.query.filter_by(client_id=user_id).all()
    elif user.role == UserRole.COUNSELOR:
        # Show only applications assigned to this counselor
        applications = Application.query.filter_by(counselor_id=int(user_id)).all()
    else:
        applications = Application.query.all()
    
    return jsonify({
        'success': True,
        'applications': [a.to_dict() for a in applications]
    })


@applications_bp.route('/<int:app_id>', methods=['GET'])
@jwt_required()
def get_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({'success': False, 'message': 'Application not found'}), 404
    
    return jsonify({'success': True, 'application': application.to_dict()})


@applications_bp.route('/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_application(app_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    if user.role not in [UserRole.COUNSELOR, UserRole.ADMIN]:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    application = Application.query.get(app_id)
    if not application:
        return jsonify({'success': False, 'message': 'Application not found'}), 404
    
    fields = ['university', 'country', 'course', 'intake', 'offer_letter_path']
    for field in fields:
        if field in data:
            setattr(application, field, data[field])
    
    if 'status' in data:
        application.status = data['status']
        # When a counselor accepts a pending application, assign themselves
        if data['status'] != 'pending' and data['status'] != 'rejected' and not application.counselor_id:
            application.counselor_id = user_id
    
    db.session.commit()
    
    return jsonify({'success': True, 'application': application.to_dict()})


@applications_bp.route('/<int:app_id>/stages/<int:stage_id>', methods=['PUT'])
@jwt_required()
def update_stage(app_id, stage_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    if user.role not in [UserRole.COUNSELOR, UserRole.ADMIN]:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    stage = ApplicationStage.query.get(stage_id)
    if not stage or stage.application_id != app_id:
        return jsonify({'success': False, 'message': 'Stage not found'}), 404
    
    if 'status' in data:
        stage.status = data['status']
        if data['status'] == 'completed':
            stage.completed_at = datetime.utcnow()
    
    if 'notes' in data:
        stage.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({'success': True, 'stage': stage.to_dict()})
