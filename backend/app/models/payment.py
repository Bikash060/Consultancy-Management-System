from datetime import datetime
from enum import Enum
from ..extensions import db


class PaymentType(Enum):
    STUDENT_FEE = 'student_fee'
    COMMISSION = 'commission'


class PaymentStatus(Enum):
    PENDING = 'pending'
    PAID = 'paid'
    CANCELLED = 'cancelled'


class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    type = db.Column(db.Enum(PaymentType), nullable=False)
    status = db.Column(db.Enum(PaymentStatus), default=PaymentStatus.PENDING)
    description = db.Column(db.String(255), nullable=True)
    payment_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    application = db.relationship('Application', back_populates='payments')
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'application_id': self.application_id,
            'amount': float(self.amount),
            'type': self.type.value,
            'status': self.status.value,
            'description': self.description,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None
        }
