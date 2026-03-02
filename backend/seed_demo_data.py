"""
Seed Demo Data Script
Run this script to populate the database with demo data for testing.
Usage: python seed_demo_data.py
"""

import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models.user import User, Profile, UserRole
from app.models.application import Application, ApplicationStage, ApplicationStatus, StageStatus
from app.models.appointment import Appointment, AppointmentType, AppointmentStatus
from app.models.document import Document, DocumentType, DocumentStatus
from app.models.message import Message
from app.models.notification import Notification, InternalNote
from app.models.payment import Payment, PaymentType, PaymentStatus


def clear_all_data():
    """Clear all existing data from tables"""
    print("Clearing existing data...")
    Payment.query.delete()
    InternalNote.query.delete()
    Notification.query.delete()
    Message.query.delete()
    Document.query.delete()
    ApplicationStage.query.delete()
    Application.query.delete()
    Appointment.query.delete()
    Profile.query.delete()
    User.query.delete()
    db.session.commit()
    print("All data cleared.")


def create_users():
    """Create demo users with profiles"""
    print("Creating users...")
    
    users_data = [
        # Admins
        {
            'email': 'admin@consultancy.com',
            'password': 'admin123',
            'role': UserRole.ADMIN,
            'profile': {'first_name': 'System', 'last_name': 'Admin'}
        },
        {
            'email': 'manager@consultancy.com',
            'password': 'manager123',
            'role': UserRole.ADMIN,
            'profile': {'first_name': 'Office', 'last_name': 'Manager'}
        },
        # Counselors
        {
            'email': 'sarah.johnson@consultancy.com',
            'password': 'counselor123',
            'role': UserRole.COUNSELOR,
            'phone': '+977-9841234567',
            'profile': {'first_name': 'Sarah', 'last_name': 'Johnson'}
        },
        {
            'email': 'rajesh.sharma@consultancy.com',
            'password': 'counselor123',
            'role': UserRole.COUNSELOR,
            'phone': '+977-9851234567',
            'profile': {'first_name': 'Rajesh', 'last_name': 'Sharma'}
        },
        {
            'email': 'priya.thapa@consultancy.com',
            'password': 'counselor123',
            'role': UserRole.COUNSELOR,
            'phone': '+977-9861234567',
            'profile': {'first_name': 'Priya', 'last_name': 'Thapa'}
        },
        # Clients
        {
            'email': 'ram.shrestha@gmail.com',
            'password': 'client123',
            'role': UserRole.CLIENT,
            'phone': '+977-9801234567',
            'profile': {
                'first_name': 'Ram',
                'last_name': 'Shrestha',
                'date_of_birth': datetime(1998, 5, 15).date(),
                'address': 'Kathmandu, Nepal',
                'education_background': 'Bachelor in Computer Science',
                'preferred_country': 'Australia',
                'preferred_course': 'Master of Information Technology',
                'budget': Decimal('25000.00'),
                'passport_number': 'NP12345678'
            }
        },
        {
            'email': 'sita.gurung@gmail.com',
            'password': 'client123',
            'role': UserRole.CLIENT,
            'phone': '+977-9811234567',
            'profile': {
                'first_name': 'Sita',
                'last_name': 'Gurung',
                'date_of_birth': datetime(1999, 8, 22).date(),
                'address': 'Pokhara, Nepal',
                'education_background': 'Bachelor in Business Administration',
                'preferred_country': 'UK',
                'preferred_course': 'MBA',
                'budget': Decimal('30000.00'),
                'passport_number': 'NP23456789'
            }
        },
        {
            'email': 'hari.kc@gmail.com',
            'password': 'client123',
            'role': UserRole.CLIENT,
            'phone': '+977-9821234567',
            'profile': {
                'first_name': 'Hari',
                'last_name': 'KC',
                'date_of_birth': datetime(1997, 3, 10).date(),
                'address': 'Lalitpur, Nepal',
                'education_background': 'Bachelor in Engineering',
                'preferred_country': 'Canada',
                'preferred_course': 'Master of Engineering',
                'budget': Decimal('35000.00'),
                'passport_number': 'NP34567890'
            }
        },
        {
            'email': 'maya.tamang@gmail.com',
            'password': 'client123',
            'role': UserRole.CLIENT,
            'phone': '+977-9831234567',
            'profile': {
                'first_name': 'Maya',
                'last_name': 'Tamang',
                'date_of_birth': datetime(2000, 11, 5).date(),
                'address': 'Bhaktapur, Nepal',
                'education_background': 'Bachelor in Nursing',
                'preferred_country': 'Australia',
                'preferred_course': 'Master of Nursing',
                'budget': Decimal('28000.00'),
                'passport_number': 'NP45678901'
            }
        },
        {
            'email': 'bikash.rai@gmail.com',
            'password': 'client123',
            'role': UserRole.CLIENT,
            'phone': '+977-9841234568',
            'profile': {
                'first_name': 'Bikash',
                'last_name': 'Rai',
                'date_of_birth': datetime(1996, 7, 20).date(),
                'address': 'Dharan, Nepal',
                'education_background': 'Bachelor in Commerce',
                'preferred_country': 'USA',
                'preferred_course': 'Master of Finance',
                'budget': Decimal('45000.00'),
                'passport_number': 'NP56789012'
            }
        },
        {
            'email': 'anita.magar@gmail.com',
            'password': 'client123',
            'role': UserRole.CLIENT,
            'phone': '+977-9851234568',
            'profile': {
                'first_name': 'Anita',
                'last_name': 'Magar',
                'date_of_birth': datetime(1998, 12, 8).date(),
                'address': 'Butwal, Nepal',
                'education_background': 'Bachelor in Hotel Management',
                'preferred_country': 'New Zealand',
                'preferred_course': 'Master of Hospitality Management',
                'budget': Decimal('22000.00'),
                'passport_number': 'NP67890123'
            }
        },
        {
            'email': 'sunil.bhandari@gmail.com',
            'password': 'client123',
            'role': UserRole.CLIENT,
            'phone': '+977-9861234568',
            'profile': {
                'first_name': 'Sunil',
                'last_name': 'Bhandari',
                'date_of_birth': datetime(1999, 4, 25).date(),
                'address': 'Chitwan, Nepal',
                'education_background': 'Bachelor in Agriculture',
                'preferred_country': 'Australia',
                'preferred_course': 'Master of Agricultural Science',
                'budget': Decimal('26000.00'),
                'passport_number': 'NP78901234'
            }
        },
        {
            'email': 'gita.poudel@gmail.com',
            'password': 'client123',
            'role': UserRole.CLIENT,
            'phone': '+977-9871234567',
            'profile': {
                'first_name': 'Gita',
                'last_name': 'Poudel',
                'date_of_birth': datetime(1997, 9, 12).date(),
                'address': 'Biratnagar, Nepal',
                'education_background': 'Bachelor in Arts',
                'preferred_country': 'UK',
                'preferred_course': 'Master of Arts in Media Studies',
                'budget': Decimal('32000.00'),
                'passport_number': 'NP89012345'
            }
        },
    ]
    
    created_users = []
    for user_data in users_data:
        user = User(
            email=user_data['email'],
            role=user_data['role'],
            phone=user_data.get('phone'),
            is_active=True
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        db.session.flush()
        
        profile_data = user_data['profile']
        profile = Profile(
            user_id=user.id,
            first_name=profile_data['first_name'],
            last_name=profile_data['last_name'],
            date_of_birth=profile_data.get('date_of_birth'),
            address=profile_data.get('address'),
            education_background=profile_data.get('education_background'),
            preferred_country=profile_data.get('preferred_country'),
            preferred_course=profile_data.get('preferred_course'),
            budget=profile_data.get('budget'),
            passport_number=profile_data.get('passport_number')
        )
        db.session.add(profile)
        created_users.append(user)
    
    db.session.commit()
    print(f"Created {len(created_users)} users with profiles.")
    return created_users


def create_applications(users):
    """Create demo applications with stages"""
    print("Creating applications...")
    
    counselors = [u for u in users if u.role == UserRole.COUNSELOR]
    clients = [u for u in users if u.role == UserRole.CLIENT]
    
    applications_data = [
        # Ram Shrestha - Australia - Visa Approved
        {'client_idx': 0, 'counselor_idx': 0, 'country': 'Australia', 'university': 'University of Melbourne', 'course': 'Master of Information Technology', 'intake': 'Feb 2025', 'status': ApplicationStatus.VISA_APPROVED},
        # Sita Gurung - UK - Offer Received
        {'client_idx': 1, 'counselor_idx': 1, 'country': 'United Kingdom', 'university': 'University of Manchester', 'course': 'MBA', 'intake': 'Sep 2025', 'status': ApplicationStatus.OFFER_RECEIVED},
        # Hari KC - Canada - Visa Lodged
        {'client_idx': 2, 'counselor_idx': 0, 'country': 'Canada', 'university': 'University of Toronto', 'course': 'Master of Engineering', 'intake': 'Jan 2025', 'status': ApplicationStatus.VISA_LODGED},
        # Maya Tamang - Australia - Application Submitted
        {'client_idx': 3, 'counselor_idx': 2, 'country': 'Australia', 'university': 'Monash University', 'course': 'Master of Nursing', 'intake': 'Jul 2025', 'status': ApplicationStatus.APPLICATION_SUBMITTED},
        # Bikash Rai - USA - Document Collection
        {'client_idx': 4, 'counselor_idx': 1, 'country': 'United States', 'university': 'New York University', 'course': 'Master of Finance', 'intake': 'Aug 2025', 'status': ApplicationStatus.DOCUMENT_COLLECTION},
        # Anita Magar - New Zealand - Visa Approved
        {'client_idx': 5, 'counselor_idx': 2, 'country': 'New Zealand', 'university': 'Auckland University of Technology', 'course': 'Master of Hospitality Management', 'intake': 'Feb 2025', 'status': ApplicationStatus.VISA_APPROVED},
        # Sunil Bhandari - Australia - Visa Rejected
        {'client_idx': 6, 'counselor_idx': 0, 'country': 'Australia', 'university': 'University of Queensland', 'course': 'Master of Agricultural Science', 'intake': 'Feb 2025', 'status': ApplicationStatus.VISA_REJECTED},
        # Gita Poudel - UK - Offer Received
        {'client_idx': 7, 'counselor_idx': 1, 'country': 'United Kingdom', 'university': 'University of Leeds', 'course': 'Master of Arts in Media Studies', 'intake': 'Sep 2025', 'status': ApplicationStatus.OFFER_RECEIVED},
        # Additional applications for some clients
        {'client_idx': 0, 'counselor_idx': 0, 'country': 'Canada', 'university': 'University of British Columbia', 'course': 'Master of Computer Science', 'intake': 'Sep 2025', 'status': ApplicationStatus.DOCUMENT_COLLECTION},
        {'client_idx': 1, 'counselor_idx': 2, 'country': 'Australia', 'university': 'University of Sydney', 'course': 'MBA', 'intake': 'Feb 2025', 'status': ApplicationStatus.VISA_LODGED},
    ]
    
    stage_names = [
        'Document Collection',
        'Application Submitted',
        'Offer Letter',
        'Visa Lodged',
        'Visa Decision'
    ]
    
    created_applications = []
    for app_data in applications_data:
        app = Application(
            client_id=clients[app_data['client_idx']].id,
            counselor_id=counselors[app_data['counselor_idx']].id,
            country=app_data['country'],
            university=app_data['university'],
            course=app_data['course'],
            intake=app_data['intake'],
            status=app_data['status'],
            created_at=datetime.utcnow() - timedelta(days=random.randint(10, 90))
        )
        db.session.add(app)
        db.session.flush()
        
        # Create stages based on application status
        status_order = [
            ApplicationStatus.DOCUMENT_COLLECTION,
            ApplicationStatus.APPLICATION_SUBMITTED,
            ApplicationStatus.OFFER_RECEIVED,
            ApplicationStatus.VISA_LODGED,
            ApplicationStatus.VISA_APPROVED
        ]
        
        current_status_idx = status_order.index(app_data['status']) if app_data['status'] in status_order else 5
        
        for idx, stage_name in enumerate(stage_names):
            if idx < current_status_idx:
                stage_status = StageStatus.COMPLETED
                completed_at = datetime.utcnow() - timedelta(days=random.randint(1, 30))
            elif idx == current_status_idx:
                stage_status = StageStatus.IN_PROGRESS
                completed_at = None
            else:
                stage_status = StageStatus.PENDING
                completed_at = None
            
            stage = ApplicationStage(
                application_id=app.id,
                stage_name=stage_name,
                status=stage_status,
                completed_at=completed_at,
                notes=f"Stage notes for {stage_name}" if stage_status == StageStatus.COMPLETED else None
            )
            db.session.add(stage)
        
        created_applications.append(app)
    
    db.session.commit()
    print(f"Created {len(created_applications)} applications with stages.")
    return created_applications


def create_appointments(users):
    """Create demo appointments"""
    print("Creating appointments...")
    
    counselors = [u for u in users if u.role == UserRole.COUNSELOR]
    clients = [u for u in users if u.role == UserRole.CLIENT]
    
    appointments = []
    
    # Past appointments (completed)
    for i in range(10):
        apt = Appointment(
            client_id=random.choice(clients).id,
            counselor_id=random.choice(counselors).id,
            scheduled_at=datetime.utcnow() - timedelta(days=random.randint(5, 60)),
            type=random.choice([AppointmentType.ONLINE, AppointmentType.OFFLINE]),
            status=AppointmentStatus.COMPLETED,
            notes=random.choice([
                'Initial consultation',
                'Document review session',
                'Application follow-up',
                'Visa guidance meeting',
                'Pre-departure briefing'
            ])
        )
        appointments.append(apt)
        db.session.add(apt)
    
    # Today's appointments
    today = datetime.utcnow().replace(hour=10, minute=0, second=0, microsecond=0)
    for i, client in enumerate(clients[:3]):
        apt = Appointment(
            client_id=client.id,
            counselor_id=counselors[i % len(counselors)].id,
            scheduled_at=today + timedelta(hours=i * 2),
            type=AppointmentType.ONLINE,
            status=AppointmentStatus.ACCEPTED,
            notes='Scheduled consultation'
        )
        appointments.append(apt)
        db.session.add(apt)
    
    # Upcoming appointments
    for i in range(8):
        apt = Appointment(
            client_id=random.choice(clients).id,
            counselor_id=random.choice(counselors).id,
            scheduled_at=datetime.utcnow() + timedelta(days=random.randint(1, 14), hours=random.randint(9, 17)),
            type=random.choice([AppointmentType.ONLINE, AppointmentType.OFFLINE]),
            status=random.choice([AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED]),
            notes=random.choice([
                'Follow-up meeting',
                'Document collection',
                'Application review',
                'University selection discussion',
                None
            ])
        )
        appointments.append(apt)
        db.session.add(apt)
    
    db.session.commit()
    print(f"Created {len(appointments)} appointments.")
    return appointments


def create_documents(users):
    """Create demo documents"""
    print("Creating documents...")
    
    clients = [u for u in users if u.role == UserRole.CLIENT]
    documents = []
    
    document_types = [
        (DocumentType.PASSPORT, 'passport.pdf'),
        (DocumentType.TRANSCRIPT, 'academic_transcript.pdf'),
        (DocumentType.SOP, 'statement_of_purpose.pdf'),
        (DocumentType.BANK_STATEMENT, 'bank_statement.pdf'),
        (DocumentType.RECOMMENDATION, 'recommendation_letter.pdf'),
        (DocumentType.CERTIFICATE, 'english_certificate.pdf'),
    ]
    
    for client in clients:
        # Each client gets 3-6 documents
        num_docs = random.randint(3, 6)
        selected_docs = random.sample(document_types, num_docs)
        
        for doc_type, file_name in selected_docs:
            status = random.choice([
                DocumentStatus.VERIFIED,
                DocumentStatus.VERIFIED,
                DocumentStatus.PENDING,
                DocumentStatus.NEEDS_CORRECTION
            ])
            
            doc = Document(
                user_id=client.id,
                type=doc_type,
                file_name=f"{client.profile.first_name.lower()}_{file_name}",
                file_path=f"/uploads/documents/{client.id}/{file_name}",
                status=status,
                comments="Document looks good" if status == DocumentStatus.VERIFIED else "Please resubmit" if status == DocumentStatus.NEEDS_CORRECTION else None,
                uploaded_at=datetime.utcnow() - timedelta(days=random.randint(5, 60)),
                verified_at=datetime.utcnow() - timedelta(days=random.randint(1, 5)) if status == DocumentStatus.VERIFIED else None
            )
            documents.append(doc)
            db.session.add(doc)
    
    db.session.commit()
    print(f"Created {len(documents)} documents.")
    return documents


def create_messages(users):
    """Create demo messages"""
    print("Creating messages...")
    
    counselors = [u for u in users if u.role == UserRole.COUNSELOR]
    clients = [u for u in users if u.role == UserRole.CLIENT]
    
    messages = []
    sample_messages = [
        "Hello! I wanted to check on my application status.",
        "Hi! Your documents have been received and are under review.",
        "Thank you for the update. When can I expect the next step?",
        "We should have an update within 2-3 business days.",
        "I have uploaded my bank statement. Please verify.",
        "Great! I'll review it today and let you know.",
        "Is there anything else I need to submit?",
        "Your file is complete. We'll proceed with the application.",
        "Thank you for your help!",
        "You're welcome! Feel free to reach out if you have questions.",
        "When is my appointment scheduled?",
        "Your appointment is confirmed for tomorrow at 10 AM.",
        "I need to reschedule my appointment.",
        "No problem. What time works better for you?",
    ]
    
    for client in clients[:5]:  # Messages for first 5 clients
        counselor = random.choice(counselors)
        num_messages = random.randint(3, 8)
        
        for i in range(num_messages):
            sender = client if i % 2 == 0 else counselor
            receiver = counselor if i % 2 == 0 else client
            
            msg = Message(
                sender_id=sender.id,
                receiver_id=receiver.id,
                content=random.choice(sample_messages),
                is_read=i < num_messages - 2,  # Last 2 messages unread
                sent_at=datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            )
            messages.append(msg)
            db.session.add(msg)
    
    db.session.commit()
    print(f"Created {len(messages)} messages.")
    return messages


def create_notifications(users):
    """Create demo notifications"""
    print("Creating notifications...")
    
    notifications = []
    notification_templates = [
        ('Application Update', 'Your application status has been updated.'),
        ('Document Verified', 'Your document has been verified successfully.'),
        ('New Message', 'You have received a new message from your counselor.'),
        ('Appointment Reminder', 'You have an appointment scheduled for tomorrow.'),
        ('Payment Due', 'Your application fee payment is due.'),
        ('Document Request', 'Please upload your missing documents.'),
    ]
    
    for user in users:
        num_notifications = random.randint(2, 5)
        selected_notifs = random.sample(notification_templates, min(num_notifications, len(notification_templates)))
        
        for title, message in selected_notifs:
            notif = Notification(
                user_id=user.id,
                title=title,
                message=message,
                is_read=random.choice([True, True, False]),
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 14))
            )
            notifications.append(notif)
            db.session.add(notif)
    
    db.session.commit()
    print(f"Created {len(notifications)} notifications.")
    return notifications


def create_payments(applications):
    """Create demo payments"""
    print("Creating payments...")
    
    payments = []
    
    for app in applications:
        # Application fee
        status = PaymentStatus.PAID if app.status.value in ['offer_received', 'visa_lodged', 'visa_approved'] else random.choice([PaymentStatus.PENDING, PaymentStatus.PAID])
        
        payment = Payment(
            application_id=app.id,
            amount=Decimal(random.choice([500, 750, 1000, 1500])),
            type=PaymentType.STUDENT_FEE,
            status=status,
            description='Application processing fee',
            payment_date=datetime.utcnow() - timedelta(days=random.randint(5, 30)) if status == PaymentStatus.PAID else None
        )
        payments.append(payment)
        db.session.add(payment)
        
        # Commission for approved/completed applications
        if app.status in [ApplicationStatus.VISA_APPROVED, ApplicationStatus.OFFER_RECEIVED]:
            commission = Payment(
                application_id=app.id,
                amount=Decimal(random.choice([2000, 3000, 4000, 5000])),
                type=PaymentType.COMMISSION,
                status=PaymentStatus.PAID if app.status == ApplicationStatus.VISA_APPROVED else PaymentStatus.PENDING,
                description='University commission',
                payment_date=datetime.utcnow() - timedelta(days=random.randint(1, 10)) if app.status == ApplicationStatus.VISA_APPROVED else None
            )
            payments.append(commission)
            db.session.add(commission)
    
    db.session.commit()
    print(f"Created {len(payments)} payments.")
    return payments


def create_internal_notes(users):
    """Create demo internal notes"""
    print("Creating internal notes...")
    
    counselors = [u for u in users if u.role == UserRole.COUNSELOR]
    clients = [u for u in users if u.role == UserRole.CLIENT]
    
    notes = []
    sample_notes = [
        "Client is very motivated and responsive.",
        "Financial documents need verification.",
        "Good academic background, strong candidate.",
        "Consider recommending alternative universities.",
        "Follow up required on missing documents.",
        "Client prefers online meetings.",
        "Visa interview preparation needed.",
        "All documents collected, ready for submission.",
    ]
    
    for client in clients:
        counselor = random.choice(counselors)
        num_notes = random.randint(1, 3)
        
        for _ in range(num_notes):
            note = InternalNote(
                counselor_id=counselor.id,
                client_id=client.id,
                note=random.choice(sample_notes),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60))
            )
            notes.append(note)
            db.session.add(note)
    
    db.session.commit()
    print(f"Created {len(notes)} internal notes.")
    return notes


def seed_database():
    """Main function to seed the database"""
    app = create_app()
    
    with app.app_context():
        print("\n" + "="*50)
        print("Starting Database Seeding")
        print("="*50 + "\n")
        
        # Clear existing data
        clear_all_data()
        
        # Create demo data
        users = create_users()
        applications = create_applications(users)
        create_appointments(users)
        create_documents(users)
        create_messages(users)
        create_notifications(users)
        create_payments(applications)
        create_internal_notes(users)
        
        print("\n" + "="*50)
        print("Database Seeding Complete!")
        print("="*50)
        print("\nDemo Accounts:")
        print("-" * 40)
        print("Admin:     admin@consultancy.com / admin123")
        print("Counselor: sarah.johnson@consultancy.com / counselor123")
        print("Client:    ram.shrestha@gmail.com / client123")
        print("-" * 40 + "\n")


if __name__ == '__main__':
    seed_database()
