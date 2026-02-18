from datetime import datetime
from enum import Enum
from ..extensions import db
import bcrypt


class UserRole(Enum):
    CLIENT = 'client'
    COUNSELOR = 'counselor'
    ADMIN = 'admin'


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.CLIENT, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    profile = db.relationship('Profile', back_populates='user', uselist=False, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', foreign_keys='Appointment.client_id', back_populates='client')
    documents = db.relationship('Document', foreign_keys='Document.user_id', back_populates='user', cascade='all, delete-orphan')
    applications = db.relationship('Application', foreign_keys='Application.client_id', back_populates='client')
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', back_populates='sender')
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', back_populates='receiver')
    notifications = db.relationship('Notification', back_populates='user', cascade='all, delete-orphan')
    
    def set_password(self, password: str) -> None:
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'email': self.email,
            'phone': self.phone,
            'role': self.role.value,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'profile': self.profile.to_dict() if self.profile else None
        }


class Profile(db.Model):
    __tablename__ = 'profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    address = db.Column(db.Text, nullable=True)
    education_background = db.Column(db.Text, nullable=True)
    preferred_country = db.Column(db.String(100), nullable=True)
    preferred_course = db.Column(db.String(200), nullable=True)
    budget = db.Column(db.Numeric(12, 2), nullable=True)
    passport_number = db.Column(db.String(50), nullable=True)
    
    user = db.relationship('User', back_populates='profile')
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'address': self.address,
            'education_background': self.education_background,
            'preferred_country': self.preferred_country,
            'preferred_course': self.preferred_course,
            'budget': float(self.budget) if self.budget else None,
            'passport_number': self.passport_number
        }
