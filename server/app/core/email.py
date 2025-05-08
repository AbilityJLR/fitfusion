import logging
import smtplib
from email.message import EmailMessage
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from typing import Dict, List, Optional, Any
import os

from app.core.config import settings

logger = logging.getLogger(__name__)

# Email template environment
templates_directory = Path(__file__).parent.parent / "templates" / "email"
if not templates_directory.exists():
    os.makedirs(templates_directory)

env = Environment(loader=FileSystemLoader(templates_directory))

def send_email(
    to_emails: List[str],
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    from_email: Optional[str] = None,
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
) -> bool:
    """Generic function to send an email"""
    if not to_emails:
        logger.error("No recipients specified for email")
        return False
        
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.error("SMTP credentials not configured, skipping email send")
        return False
    
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email or f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
    msg["To"] = ", ".join(to_emails)
    
    if cc:
        msg["Cc"] = ", ".join(cc)
    if bcc:
        msg["Bcc"] = ", ".join(bcc)
    
    # Set content
    if html_content:
        msg.add_alternative(html_content, subtype="html")
    if text_content:
        msg.add_alternative(text_content, subtype="plain")
    elif html_content:  # Create plain text from HTML if not provided
        from html2text import html2text
        text_content = html2text(html_content)
        msg.add_alternative(text_content, subtype="plain")
    
    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Email sent to {', '.join(to_emails)}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

def render_email_template(
    template_name: str, 
    context: Dict[str, Any]
) -> str:
    """Render an email template with context"""
    try:
        template = env.get_template(f"{template_name}.html")
        return template.render(**context)
    except Exception as e:
        logger.error(f"Failed to render email template {template_name}: {e}")
        # Fallback to simple template if loading fails
        return f"""
        <html>
            <body>
                <h1>{context.get('subject', 'Notification')}</h1>
                <p>{context.get('message', '')}</p>
                <p>Thank you,<br/>The {settings.PROJECT_NAME} Team</p>
            </body>
        </html>
        """

def send_verification_email(user_email: str, verification_url: str) -> bool:
    """Send email verification link"""
    context = {
        "subject": f"Verify your {settings.PROJECT_NAME} account",
        "project_name": settings.PROJECT_NAME,
        "verification_url": verification_url,
        "message": "Please click the link below to verify your email address."
    }
    
    html_content = render_email_template("verification", context)
    subject = context["subject"]
    
    return send_email(
        to_emails=[user_email],
        subject=subject,
        html_content=html_content
    )

def send_password_reset_email(user_email: str, reset_url: str) -> bool:
    """Send password reset link"""
    context = {
        "subject": f"Reset your {settings.PROJECT_NAME} password",
        "project_name": settings.PROJECT_NAME,
        "reset_url": reset_url,
        "message": "You recently requested to reset your password. Click the link below to set a new password."
    }
    
    html_content = render_email_template("password_reset", context)
    subject = context["subject"]
    
    return send_email(
        to_emails=[user_email],
        subject=subject,
        html_content=html_content
    ) 