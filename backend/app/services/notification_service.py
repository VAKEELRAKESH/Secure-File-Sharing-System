"""
Notification Service — stub for email notifications via SMTP/SendGrid.
Provides structured notification dispatch for share events, security alerts,
download notifications, and expiration reminders.

In development mode, notifications are logged to console.
In production, configure SMTP or SendGrid settings in config.
"""
import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger("trustshare.notifications")


class NotificationService:
    """
    Centralized notification dispatch engine.
    Supports email delivery (SMTP/SendGrid), in-app notification logging, 
    and future push notification channels.
    """

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
            f"Your reset token: {reset_token}\n\n"
            f"This token expires in 15 minutes.\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"— TrustShare Security Team"
        )
        _dispatch_email(user_email, subject, body)


def _dispatch_email(to: str, subject: str, body: str):
    """
    Internal email dispatcher.
    In development: logs to console.
    In production: configure SMTP_HOST/SENDGRID_API_KEY in settings.
    
    TODO: Integrate with SMTP or SendGrid when email credentials are configured.
    """
    logger.info(
        f"\n{'='*60}\n"
        f"EMAIL NOTIFICATION (dev mode — not actually sent)\n"
        f"To: {to}\n"
        f"Subject: {subject}\n"
        f"{'='*60}\n"
        f"{body}\n"
        f"{'='*60}"
    )


notification_service = NotificationService()
