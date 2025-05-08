"""
Django development settings for server project.
"""

import os
from .base import *

# SECURITY WARNING: keep the secret key used in development secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-u=az8t48iv_cny*(5bwkid72e!enn#=0#h04umoa@5@6+8d!!3')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
if os.environ.get('DATABASE_URL'):
    # Use DATABASE_URL if it's set (for docker-compose)
    from dj_database_url import parse as db_url
    DATABASES = {
        'default': db_url(os.environ.get('DATABASE_URL'))
    }
else:
    # Use SQLite for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# CORS settings for development
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
CORS_ALLOW_CREDENTIALS = True

# Set development logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
} 