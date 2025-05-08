from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import json
import os

# Create your views here.
@csrf_exempt
def test_db_connection(request):
    """
    Test database connection and return connection info
    """
    # Set response headers to avoid CORS issues
    response = JsonResponse({})
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    # Handle preflight requests
    if request.method == "OPTIONS":
        return response
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_connection = True
    except Exception as e:
        db_connection = False
        error = str(e)
    
    # Get database info from settings
    db_settings = settings.DATABASES.get('default', {})
    
    # Extract hostname from DATABASE_URL if it exists
    database_url = os.environ.get('DATABASE_URL', '')
    hostname = database_url.split('@')[1].split('/')[0] if '@' in database_url and len(database_url.split('@')) > 1 else 'Not found in DATABASE_URL'
    
    response_data = {
        'database_connected': db_connection,
        'database_name': db_settings.get('NAME', 'Not provided'),
        'database_host': db_settings.get('HOST', hostname),
        'engine': db_settings.get('ENGINE', 'Not provided'),
        'environment': 'Production' if not settings.DEBUG else 'Development',
        'api_running': True
    }
    
    if not db_connection and 'error' in locals():
        response_data['error'] = error
    
    response = JsonResponse(response_data)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response
