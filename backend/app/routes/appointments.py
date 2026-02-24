from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..extensions import db
from ..models.user import User, UserRole
from ..models.appointment import Appointment, AppointmentStatus, AppointmentType

appointments_bp = Blueprint('appointments', __name__)


@appointments_bp.route('', methods=['POST'])
@jwt_required()
def create_appointment():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    counselor_id = data.get('counselor_id')
    scheduled_at = data.get('scheduled_at')
    appointment_type = data.get('type', 'online')
    notes = data.get('notes', '')
    
    if not counselor_id or not scheduled_at:
        return jsonify({'success': False, 'message': 'Counselor and date required'}), 400
    
    counselor = User.query.get(counselor_id)
    if not counselor or counselor.role != UserRole.COUNSELOR:
        return jsonify({'success': False, 'message': 'Invalid counselor'}), 400
    
    appointment = Appointment(
        client_id=user_id,
        counselor_id=counselor_id,
        scheduled_at=datetime.fromisoformat(scheduled_at),
        type=AppointmentType(appointment_type),
        notes=notes
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Appointment booked',
        'appointment': appointment.to_dict()
    }), 201


@appointments_bp.route('', methods=['GET'])
@jwt_required()
def get_appointments():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    if user.role == UserRole.CLIENT:
        appointments = Appointment.query.filter_by(client_id=user_id).all()
    elif user.role == UserRole.COUNSELOR:
        appointments = Appointment.query.filter_by(counselor_id=user_id).all()
    else:  # ADMIN
        appointments = Appointment.query.all()
    
    return jsonify({
        'success': True,
        'appointments': [a.to_dict() for a in appointments]
    })


@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({'success': False, 'message': 'Appointment not found'}), 404
    
    # Check permission
    if user.role == UserRole.CLIENT and appointment.client_id != user_id:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    if user.role == UserRole.COUNSELOR and appointment.counselor_id != user_id:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    if 'status' in data:
        appointment.status = AppointmentStatus(data['status'])
    if 'scheduled_at' in data:
        appointment.scheduled_at = datetime.fromisoformat(data['scheduled_at'])
    if 'notes' in data:
        appointment.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({'success': True, 'appointment': appointment.to_dict()})


@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(appointment_id):
    user_id = get_jwt_identity()
    
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({'success': False, 'message': 'Appointment not found'}), 404
    
    if appointment.client_id != user_id:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    appointment.status = AppointmentStatus.CANCELLED
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Appointment cancelled'})
