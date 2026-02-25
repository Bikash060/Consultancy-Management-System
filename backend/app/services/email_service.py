from flask import current_app
from flask_mail import Message
from ..extensions import mail


class EmailService:
    @staticmethod
    def send_email(to: str, subject: str, body: str) -> bool:
        try:
            msg = Message(
                subject=subject,
                recipients=[to],
                body=body,
                sender=current_app.config['MAIL_DEFAULT_SENDER']
            )
            mail.send(msg)
            return True
        except Exception as e:
            print(f"Email error: {e}")
            return False
    
    @staticmethod
    def send_password_reset(email: str, reset_link: str) -> bool:
        subject = "Password Reset Request"
        body = f"""
You have requested to reset your password.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you did not request this, please ignore this email.
"""
        return EmailService.send_email(email, subject, body)
    
    @staticmethod
    def send_appointment_reminder(email: str, appointment_date: str, counselor_name: str) -> bool:
        subject = "Appointment Reminder"
        body = f"""
This is a reminder for your upcoming appointment:

Date: {appointment_date}
Counselor: {counselor_name}

Please make sure to be available at the scheduled time.
"""
        return EmailService.send_email(email, subject, body)
    
    @staticmethod
    def send_document_status(email: str, doc_name: str, status: str, comments: str = "") -> bool:
        subject = f"Document Status Update: {doc_name}"
        body = f"""
Your document "{doc_name}" has been reviewed.

Status: {status.upper()}
{f'Comments: {comments}' if comments else ''}

Please log in to your account for more details.
"""
        return EmailService.send_email(email, subject, body)
