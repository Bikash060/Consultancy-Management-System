from datetime import datetime
from enum import Enum
from ..extensions import db


class ApplicationStatus(Enum):
    DOCUMENT_COLLECTION = 'document_collection'
    APPLICATION_SUBMITTED = 'application_submitted'
    OFFER_RECEIVED = 'offer_received'
    VISA_LODGED = 'visa_lodged'
    VISA_APPROVED = 'visa_approved'
    VISA_REJECTED = 'visa_rejected'


class StageStatus(Enum):
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'


class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    counselor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    university = db.Column(db.String(200), nullable=True)
    country = db.Column(db.String(100), nullable=False)
    course = db.Column(db.String(200), nullable=True)
    intake = db.Column(db.String(50), nullable=True)
    status = db.Column(db.Enum(ApplicationStatus), default=ApplicationStatus.DOCUMENT_COLLECTION)
    offer_letter_path = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    client = db.relationship('User', foreign_keys=[client_id], back_populates='applications')
    counselor = db.relationship('User', foreign_keys=[counselor_id])
    stages = db.relationship('ApplicationStage', back_populates='application', cascade='all, delete-orphan')
    payments = db.relationship('Payment', back_populates='application', cascade='all, delete-orphan')
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'client_id': self.client_id,
            'counselor_id': self.counselor_id,
            'university': self.university,
            'country': self.country,
            'course': self.course,
            'intake': self.intake,
            'status': self.status.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'stages': [s.to_dict() for s in self.stages]
        }


class ApplicationStage(db.Model):
    __tablename__ = 'application_stages'
    
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False)
    stage_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Enum(StageStatus), default=StageStatus.PENDING)
    notes = db.Column(db.Text, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    application = db.relationship('Application', back_populates='stages')
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'stage_name': self.stage_name,
            'status': self.status.value,
            'notes': self.notes,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
