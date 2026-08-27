"""
Notification Service — handles email delivery via SMTP/SendGrid with development console fallback.
Provides structured notification dispatch for share events, security alerts,
download notifications, expiration reminders, OTP verification, and password resets.
"""
import smtplib
import logging
from email.message import EmailMessage
from typing import Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger("trustshare.notifications")


class NotificationService:
    """
    Centralized notification dispatch engine.
    Supports email delivery (SMTP / SendGrid) with development fallback logging.
    """

    @staticmethod
    def send_verification_otp_email(
        user_email: str,
        otp: str
    ):
        """Send a 6-digit verification code to newly registered user."""
        subject = "[TrustShare] Verify Your Email Address"
        body = (
            f"Hello,\n\n"
            f"Welcome to TrustShare! Your account verification code is:\n\n"
            f"    {otp}\n\n"
            f"This code will expire in 10 minutes.\n"
            f"If you did not create an account on TrustShare, you can safely ignore this message.\n\n"
            f"— TrustShare Security Team"
        )
        _dispatch_email(user_email, subject, body)

    @staticmethod
    def send_share_notification(
        recipient_email: str,
        sender_name: str,
        filename: str,
        share_url: str,
        expires_at: Optional[datetime] = None
    ):
        """Notify a recipient that a file has been shared with them."""
        subject = f"[TrustShare] {sender_name} shared a file with you"
        body = (
            f"Hello,\n\n"
            f"{sender_name} has shared the file '{filename}' with you on TrustShare.\n"
            f"Access it here: {share_url}\n"
        )
        if expires_at:
            body += f"\nThis link expires on: {expires_at.strftime('%Y-%m-%d %H:%M UTC')}\n"
        body += "\n— TrustShare Secure File Sharing Platform"

        _dispatch_email(recipient_email, subject, body)

    @staticmethod
    def send_download_notification(
        owner_email: str,
        filename: str,
        downloader_ip: str,
        share_token: str
    ):
        """Notify the file owner when someone downloads their shared file."""
        subject = f"[TrustShare] Your file '{filename}' was downloaded"
        body = (
            f"Hello,\n\n"
            f"Your shared file '{filename}' was downloaded via share token.\n"
            f"Downloader IP: {downloader_ip}\n"
            f"Share Token: {share_token[:16]}...\n\n"
            f"If this was unexpected, please revoke the share link immediately.\n\n"
            f"— TrustShare Security Team"
        )
        _dispatch_email(owner_email, subject, body)

    @staticmethod
    def send_security_alert(
        user_email: str,
        alert_title: str,
        alert_description: str,
        severity: str = "MEDIUM"
    ):
        """Send an urgent security alert notification."""
        subject = f"[TrustShare SECURITY {severity}] {alert_title}"
        body = (
            f"SECURITY ALERT\n"
            f"Severity: {severity}\n\n"
            f"{alert_description}\n\n"
            f"Please review your account activity immediately.\n\n"
            f"— TrustShare Threat Detection Engine"
        )
        _dispatch_email(user_email, subject, body)

    @staticmethod
    def send_expiration_reminder(
        owner_email: str,
        filename: str,
        share_token: str,
        expires_at: datetime
    ):
        """Remind file owner that a share link is about to expire."""
        subject = f"[TrustShare] Share link for '{filename}' expiring soon"
        body = (
            f"Hello,\n\n"
            f"Your share link for '{filename}' will expire on "
            f"{expires_at.strftime('%Y-%m-%d %H:%M UTC')}.\n\n"
            f"If you need to extend access, please create a new share link.\n\n"
            f"— TrustShare Platform"
        )
        _dispatch_email(owner_email, subject, body)

    @staticmethod
    def send_password_reset_email(
        user_email: str,
        reset_token: str
    ):
        """Send password reset token via email."""
        subject = "[TrustShare] Password Reset Request"
        body = (
            f"Hello,\n\n"
            f"A password reset was requested for your TrustShare account.\n"
            f"Your reset token is:\n\n"
            f"    {reset_token}\n\n"
            f"This token expires in 15 minutes.\n"
            f"If you did not request this password reset, please ignore this email.\n\n"
            f"— TrustShare Security Team"
        )
        _dispatch_email(user_email, subject, body)


def _dispatch_email(to: str, subject: str, body: str):
    """
    Dispatches email via configured SMTP server when available.
    Falls back to development console logging when SMTP is not configured.
    """
    if settings.SMTP_HOST:
        try:
            msg = EmailMessage()
            msg.set_content(body)
            msg["Subject"] = subject
            from_addr = settings.SMTP_FROM or settings.SMTP_FROM_EMAIL
            msg["From"] = from_addr
            msg["To"] = to

            port = settings.SMTP_PORT or 587
            smtp_user = settings.SMTP_USER or settings.SMTP_USERNAME
            smtp_pass = settings.SMTP_PASSWORD

            if port == 465:
                with smtplib.SMTP_SSL(settings.SMTP_HOST, port, timeout=10) as server:
                    if smtp_user and smtp_pass:
                        server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(settings.SMTP_HOST, port, timeout=10) as server:
                    server.starttls()
                    if smtp_user and smtp_pass:
                        server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
            logger.info(f"Email successfully dispatched to {to} via SMTP ({settings.SMTP_HOST})")
            return
        except Exception as e:
            logger.error(f"Failed to send email to {to} via SMTP: {e}. Falling back to console logging.")

    # Development fallback logging
    print(f"\n[EMAIL OUT-OF-BAND DISPATCH] To: {to} | Subject: {subject}\n{body}\n")
    logger.info(
        f"\n{'='*60}\n"
        f"EMAIL NOTIFICATION (Local Dispatch)\n"
        f"To: {to}\n"
        f"Subject: {subject}\n"
        f"{'='*60}\n"
        f"{body}\n"
        f"{'='*60}"
    )


notification_service = NotificationService()
