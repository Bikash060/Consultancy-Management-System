from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract, case
from datetime import datetime, timedelta
from ..extensions import db
from ..models.user import User, UserRole, Profile
from ..models.application import Application, ApplicationStatus
from ..models.appointment import Appointment
from ..models.document import Document
from ..models.settings import Country, University, Course, Setting, Intake
from ..utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)


# ─── Dashboard ────────────────────────────────────────────────────────────────

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard():
    total_clients = User.query.filter_by(role=UserRole.CLIENT).count()
    total_counselors = User.query.filter_by(role=UserRole.COUNSELOR).count()
    total_applications = Application.query.count()
    pending_appointments = Appointment.query.filter_by(status='pending').count()

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
            'pending_appointments': pending_appointments,
            'visa_approved': visa_approved,
            'visa_rejected': visa_rejected,
            'visa_success_rate': round(visa_success_rate, 2)
        }
    })


@admin_bp.route('/dashboard/monthly-trends', methods=['GET'])
@jwt_required()
@admin_required
def monthly_trends():
    """Real monthly application trends for the last 6 months."""
    six_months_ago = datetime.utcnow() - timedelta(days=180)

    rows = db.session.query(
        extract('year', Application.created_at).label('yr'),
        extract('month', Application.created_at).label('mo'),
        func.count(Application.id).label('total'),
        func.sum(
            case(
                (Application.status == ApplicationStatus.VISA_APPROVED, 1),
                else_=0
            )
        ).label('approved')
    ).filter(
        Application.created_at >= six_months_ago
    ).group_by('yr', 'mo').order_by('yr', 'mo').all()

    month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    trends = []
    for r in rows:
        trends.append({
            'name': month_names[int(r.mo)],
            'applications': int(r.total),
            'approved': int(r.approved or 0),
        })

    return jsonify({'success': True, 'trends': trends})


# ─── Users (with pagination) ─────────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    role = request.args.get('role')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '').strip()

    query = User.query
    if role:
        query = query.filter_by(role=UserRole(role))

    if search:
        query = query.outerjoin(Profile).filter(
            db.or_(
                User.email.ilike(f'%{search}%'),
                Profile.first_name.ilike(f'%{search}%'),
                Profile.last_name.ilike(f'%{search}%'),
            )
        )

    query = query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev,
        }
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
    phone = data.get('phone', '').strip()

    if not email or not password or not first_name:
        return jsonify({'success': False, 'message': 'Email, password and first name required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 409

    user = User(email=email, role=UserRole(role), phone=phone if phone else None)
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


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'success': True, 'message': 'User deleted'})


# ─── Reports ─────────────────────────────────────────────────────────────────

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


@admin_bp.route('/reports/university-stats', methods=['GET'])
@jwt_required()
@admin_required
def university_stats():
    """Applications grouped by university."""
    stats = db.session.query(
        Application.university,
        Application.country,
        func.count(Application.id).label('total'),
        func.sum(
            case(
                (Application.status == ApplicationStatus.VISA_APPROVED, 1),
                else_=0
            )
        ).label('approved')
    ).filter(
        Application.university.isnot(None),
        Application.university != ''
    ).group_by(Application.university, Application.country).all()

    return jsonify({
        'success': True,
        'stats': [{
            'university': s[0],
            'country': s[1],
            'total': int(s[2]),
            'approved': int(s[3] or 0)
        } for s in stats]
    })


@admin_bp.route('/reports/monthly-trends', methods=['GET'])
@jwt_required()
@admin_required
def reports_monthly_trends():
    """Alias for monthly trends (accessible from reports page)."""
    return monthly_trends()


# ─── Settings (General) ──────────────────────────────────────────────────────

@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
@admin_required
def get_settings():
    settings = Setting.query.all()
    result = {}
    for s in settings:
        result[s.key] = s.value
    return jsonify({'success': True, 'settings': result})


@admin_bp.route('/settings', methods=['PUT'])
@jwt_required()
@admin_required
def update_settings():
    data = request.get_json()
    for key, value in data.items():
        Setting.set(key, str(value) if value is not None else '')
    db.session.commit()
    return jsonify({'success': True, 'message': 'Settings updated'})


# ─── Countries CRUD ──────────────────────────────────────────────────────────

@admin_bp.route('/settings/countries', methods=['GET'])
@jwt_required()
@admin_required
def get_countries_admin():
    countries = Country.query.order_by(Country.name).all()
    return jsonify({
        'success': True,
        'countries': [c.to_dict(show_all=True) for c in countries]
    })


@admin_bp.route('/settings/countries', methods=['POST'])
@jwt_required()
@admin_required
def create_country():
    data = request.get_json()
    name = data.get('name', '').strip()
    code = data.get('code', '').strip().upper()

    if not name or not code:
        return jsonify({'success': False, 'message': 'Name and code are required'}), 400

    if Country.query.filter_by(name=name).first():
        return jsonify({'success': False, 'message': 'Country already exists'}), 409

    country = Country(name=name, code=code)
    db.session.add(country)
    db.session.commit()

    return jsonify({'success': True, 'country': country.to_dict()}), 201


@admin_bp.route('/settings/countries/<int:country_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_country(country_id):
    country = Country.query.get(country_id)
    if not country:
        return jsonify({'success': False, 'message': 'Country not found'}), 404

    data = request.get_json()
    if 'name' in data:
        country.name = data['name'].strip()
    if 'code' in data:
        country.code = data['code'].strip().upper()
    if 'is_active' in data:
        country.is_active = data['is_active']

    db.session.commit()
    return jsonify({'success': True, 'country': country.to_dict()})


@admin_bp.route('/settings/countries/<int:country_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_country(country_id):
    country = Country.query.get(country_id)
    if not country:
        return jsonify({'success': False, 'message': 'Country not found'}), 404

    db.session.delete(country)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Country deleted'})


# ─── Universities CRUD ───────────────────────────────────────────────────────

@admin_bp.route('/settings/countries/<int:country_id>/universities', methods=['POST'])
@jwt_required()
@admin_required
def create_university(country_id):
    country = Country.query.get(country_id)
    if not country:
        return jsonify({'success': False, 'message': 'Country not found'}), 404

    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'success': False, 'message': 'Name is required'}), 400

    uni = University(name=name, country_id=country_id)
    db.session.add(uni)
    db.session.commit()

    return jsonify({'success': True, 'university': uni.to_dict()}), 201


@admin_bp.route('/settings/universities/<int:uni_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_university(uni_id):
    uni = University.query.get(uni_id)
    if not uni:
        return jsonify({'success': False, 'message': 'University not found'}), 404

    data = request.get_json()
    if 'name' in data:
        uni.name = data['name'].strip()
    if 'is_active' in data:
        uni.is_active = data['is_active']

    db.session.commit()
    return jsonify({'success': True, 'university': uni.to_dict()})


@admin_bp.route('/settings/universities/<int:uni_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_university(uni_id):
    uni = University.query.get(uni_id)
    if not uni:
        return jsonify({'success': False, 'message': 'University not found'}), 404

    db.session.delete(uni)
    db.session.commit()
    return jsonify({'success': True, 'message': 'University deleted'})


# ─── Courses CRUD ────────────────────────────────────────────────────────────

@admin_bp.route('/settings/universities/<int:uni_id>/courses', methods=['POST'])
@jwt_required()
@admin_required
def create_course(uni_id):
    uni = University.query.get(uni_id)
    if not uni:
        return jsonify({'success': False, 'message': 'University not found'}), 404

    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'success': False, 'message': 'Name is required'}), 400

    course = Course(
        name=name,
        university_id=uni_id,
        duration=data.get('duration', '').strip() or None,
        fee=data.get('fee', '').strip() or None,
    )
    db.session.add(course)
    db.session.commit()

    return jsonify({'success': True, 'course': course.to_dict()}), 201


@admin_bp.route('/settings/courses/<int:course_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'success': False, 'message': 'Course not found'}), 404

    data = request.get_json()
    if 'name' in data:
        course.name = data['name'].strip()
    if 'duration' in data:
        course.duration = data['duration'].strip() or None
    if 'fee' in data:
        course.fee = data['fee'].strip() or None
    if 'is_active' in data:
        course.is_active = data['is_active']

    db.session.commit()
    return jsonify({'success': True, 'course': course.to_dict()})


@admin_bp.route('/settings/courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'success': False, 'message': 'Course not found'}), 404

    db.session.delete(course)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Course deleted'})


# ─── Public Countries Endpoint (for all authenticated users / dropdowns) ─────

@admin_bp.route('/countries', methods=['GET'])
@jwt_required()
def get_countries_public():
    """Returns active countries with their active universities and courses. No admin required."""
    countries = Country.query.filter_by(is_active=True).order_by(Country.name).all()
    result = []
    for c in countries:
        cd = {
            'id': c.id,
            'name': c.name,
            'code': c.code,
            'universities': []
        }
        for u in c.universities:
            if u.is_active:
                ud = {
                    'id': u.id,
                    'name': u.name,
                    'courses': [{'id': co.id, 'name': co.name, 'duration': co.duration, 'fee': co.fee}
                                for co in u.courses if co.is_active]
                }
                cd['universities'].append(ud)
        result.append(cd)
    return jsonify({'success': True, 'countries': result})


# ─── Intakes CRUD ────────────────────────────────────────────────────────────

@admin_bp.route('/intakes', methods=['GET'])
@jwt_required()
def get_intakes():
    """Get all intakes. No admin required — used by clients for application forms."""
    intakes = Intake.query.order_by(Intake.year.desc(), Intake.name).all()
    return jsonify({'success': True, 'intakes': [i.to_dict() for i in intakes]})


@admin_bp.route('/intakes', methods=['POST'])
@jwt_required()
@admin_required
def create_intake():
    data = request.get_json()
    name = data.get('name', '').strip()
    year = data.get('year')

    if not name or not year:
        return jsonify({'success': False, 'message': 'Name and year are required'}), 400

    try:
        year = int(year)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Year must be a number'}), 400

    # Check duplicate
    existing = Intake.query.filter_by(name=name, year=year).first()
    if existing:
        return jsonify({'success': False, 'message': f'{name} {year} already exists'}), 409

    intake = Intake(name=name, year=year)
    db.session.add(intake)
    db.session.commit()

    return jsonify({'success': True, 'intake': intake.to_dict()}), 201


@admin_bp.route('/intakes/<int:intake_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_intake(intake_id):
    intake = Intake.query.get(intake_id)
    if not intake:
        return jsonify({'success': False, 'message': 'Intake not found'}), 404

    db.session.delete(intake)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Intake deleted'})
