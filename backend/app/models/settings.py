"""
Settings models for country and university management.
"""
from datetime import datetime
from ..extensions import db


class Country(db.Model):
    """Countries that the consultancy operates with."""
    __tablename__ = 'countries'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    code = db.Column(db.String(5), nullable=False)  # ISO 3166-1 alpha-2
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    universities = db.relationship(
        'University', back_populates='country',
        cascade='all, delete-orphan', order_by='University.name'
    )

    def to_dict(self, include_universities=True, show_all=False) -> dict:
        data = {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_universities:
            unis = self.universities if show_all else [u for u in self.universities if u.is_active]
            data['universities'] = [u.to_dict(show_all=show_all) for u in unis]
        return data


class University(db.Model):
    """Universities affiliated with the consultancy."""
    __tablename__ = 'universities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    country_id = db.Column(db.Integer, db.ForeignKey('countries.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    country = db.relationship('Country', back_populates='universities')
    courses = db.relationship(
        'Course', back_populates='university',
        cascade='all, delete-orphan', order_by='Course.name'
    )

    def to_dict(self, include_courses=True, show_all=False) -> dict:
        data = {
            'id': self.id,
            'name': self.name,
            'country_id': self.country_id,
            'country_name': self.country.name if self.country else None,
            'is_active': self.is_active,
        }
        if include_courses:
            courses = self.courses if show_all else [c for c in self.courses if c.is_active]
            data['courses'] = [c.to_dict() for c in courses]
        return data


class Course(db.Model):
    """Courses offered by universities."""
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300), nullable=False)
    university_id = db.Column(db.Integer, db.ForeignKey('universities.id'), nullable=False)
    duration = db.Column(db.String(50), nullable=True)
    fee = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    university = db.relationship('University', back_populates='courses')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'university_id': self.university_id,
            'duration': self.duration,
            'fee': self.fee,
            'is_active': self.is_active,
        }


class Setting(db.Model):
    """Key-value settings storage."""
    __tablename__ = 'settings'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=True)

    @staticmethod
    def get(key, default=None):
        s = Setting.query.filter_by(key=key).first()
        return s.value if s else default

    @staticmethod
    def set(key, value):
        s = Setting.query.filter_by(key=key).first()
        if s:
            s.value = value
        else:
            s = Setting(key=key, value=value)
            db.session.add(s)
        return s

    def to_dict(self) -> dict:
        return {'key': self.key, 'value': self.value}


class Intake(db.Model):
    """Available intake periods for applications."""
    __tablename__ = 'intakes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g. "Fall", "Spring", "Summer"
    year = db.Column(db.Integer, nullable=False)       # e.g. 2025, 2026
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'year': self.year,
        }
