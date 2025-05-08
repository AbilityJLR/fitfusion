"""
Django settings for server project.
"""

import os

# Import the appropriate settings based on environment
if os.environ.get('ENVIRONMENT') == 'production':
    from .production import *
else:
    from .development import * 