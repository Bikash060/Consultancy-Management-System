from datetime import datetime
from enum import Enum
from ..extensions import db


class DocumentType(Enum):
    PASSPORT = 'passport'
    TRANSCRIPT = 'transcript'
    SOP = 'sop'
    BANK_STATEMENT = 'bank_statement'
    RECOMMENDATION = 'recommendation'
    CERTIFICATE = 'certificate'
    OTHER = 'other'


class DocumentStatus(Enum):
    PENDING = 'pending'
    VERIFIED = 'verified'
    REJECTED = 'rejected'
    NEEDS_CORRECTION = 'needs_correction'


class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Enum(DocumentType), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    status = db.Column(db.Enum(DocumentStatus), default=DocumentStatus.PENDING)
    comments = db.Column(db.Text, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified_at = db.Column(db.DateTime, nullable=True)
    verified_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    user = db.relationship('User', foreign_keys=[user_id], back_populates='documents')
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type.value,
            'file_name': self.file_name,
            'status': self.status.value,
            'comments': self.comments,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None
        }
