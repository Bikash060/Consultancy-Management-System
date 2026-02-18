from datetime import datetime
from enum import Enum
from ..extensions import db


class AppointmentType(Enum):
    ONLINE = 'online'
    OFFLINE = 'offline'


class AppointmentStatus(Enum):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'


class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    counselor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scheduled_at = db.Column(db.DateTime, nullable=False)
    type = db.Column(db.Enum(AppointmentType), default=AppointmentType.ONLINE)
    status = db.Column(db.Enum(AppointmentStatus), default=AppointmentStatus.PENDING)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    client = db.relationship('User', foreign_keys=[client_id], back_populates='appointments')
    counselor = db.relationship('User', foreign_keys=[counselor_id])
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'client_id': self.client_id,
            'counselor_id': self.counselor_id,
            'scheduled_at': self.scheduled_at.isoformat(),
            'type': self.type.value,
            'status': self.status.value,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
