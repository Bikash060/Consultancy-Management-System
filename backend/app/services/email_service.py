from flask import current_app
from flask_mail import Message
from ..extensions import mail


class EmailService:
    @staticmethod
    def send_email(to: str, subject: str, body: str, html: str = None) -> bool:
        try:
            msg = Message(
                subject=subject,
                recipients=[to],
                body=body,
                html=html,
                sender=current_app.config['MAIL_DEFAULT_SENDER']
            )
            mail.send(msg)
            return True
        except Exception as e:
            print(f"Email error: {e}")
            return False
    
    @staticmethod
    def send_password_reset_otp(email: str, otp_code: str) -> bool:
        """Send a password reset OTP via email with a professional HTML template."""
        subject = "Password Reset OTP — Consultancy Management"
        
        # Plain text fallback
        body = f"""
Password Reset Request

Your OTP code is: {otp_code}

This code will expire in 10 minutes.

If you did not request a password reset, please ignore this email.

— Consultancy Management System
"""
        
        # Professional HTML email
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td>
                <!-- Header -->
                <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                    <tr>
                        <td>
                            <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; line-height: 56px; font-size: 28px;">🔐</div>
                            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 700;">Password Reset</h1>
                            <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0;">Consultancy Management System</p>
                        </td>
                    </tr>
                </table>
                
                <!-- Body -->
                <table width="100%" cellspacing="0" cellpadding="0" style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td>
                            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                                We received a request to reset your password. Use the OTP code below to proceed:
                            </p>
                            
                            <!-- OTP Code Box -->
                            <div style="background: linear-gradient(135deg, #eff6ff, #f0f0ff); border: 2px solid #bfdbfe; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px; font-weight: 600;">Your OTP Code</p>
                                <p style="color: #1e40af; font-size: 36px; font-weight: 800; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">{otp_code}</p>
                            </div>
                            
                            <!-- Expiry Warning -->
                            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 0 0 24px;">
                                <p style="color: #92400e; font-size: 13px; margin: 0;">
                                    ⏰ This code will expire in <strong>10 minutes</strong>. Do not share it with anyone.
                                </p>
                            </div>
                            
                            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Footer -->
                <table width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 0; text-align: center;">
                    <tr>
                        <td>
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
        return EmailService.send_email(email, subject, body, html)
    
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
