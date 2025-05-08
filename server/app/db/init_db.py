import logging
from sqlalchemy.orm import Session

from app.db.database import Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.role import Role
from app.models.refresh_token import RefreshToken

logger = logging.getLogger(__name__)

# Create all tables
def init_db(db: Session) -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create default roles if they don't exist
    create_initial_roles(db)
    
    # Create admin user if it doesn't exist
    create_admin_user(db)

def create_initial_roles(db: Session) -> None:
    """Create initial roles if they don't exist"""
    # Define roles
    roles = [
        {"name": "user", "description": "Regular user", "is_default": True},
        {"name": "admin", "description": "Administrator", "is_default": False},
        {"name": "moderator", "description": "Content moderator", "is_default": False},
    ]
    
    # Check and create each role
    for role_data in roles:
        role = db.query(Role).filter(Role.name == role_data["name"]).first()
        if not role:
            role = Role(
                name=role_data["name"],
                description=role_data["description"],
                is_default=role_data["is_default"],
            )
            db.add(role)
            db.commit()
            logger.info(f"Created role: {role_data['name']}")

def create_admin_user(db: Session) -> None:
    """Create admin user if it doesn't exist"""
    user = db.query(User).filter(User.email == "admin@fitfusion.com").first()
    
    if not user:
        user_in = {
            "email": "admin@fitfusion.com",
            "username": "admin",
            "password": "Admin@123456",  # Change this in production
            "first_name": "Admin",
            "last_name": "User",
            "is_superuser": True,
            "is_verified": True,  # Admin is verified by default
        }
        
        user = User(
            email=user_in["email"],
            username=user_in["username"],
            hashed_password=get_password_hash(user_in["password"]),
            first_name=user_in["first_name"],
            last_name=user_in["last_name"],
            is_superuser=user_in["is_superuser"],
            is_verified=user_in["is_verified"],
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Assign admin role
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if admin_role:
            user.roles.append(admin_role)
            db.commit()
            
        logger.info("Admin user created") 