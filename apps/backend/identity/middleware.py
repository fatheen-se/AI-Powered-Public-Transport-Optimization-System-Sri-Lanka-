import logging
from django.utils import timezone

# Setup logger for the audit trail
logger = logging.getLogger('audit')
logger.setLevel(logging.INFO)

# If no handlers exist, add a stream handler (output to docker console/ELK)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - AUDIT - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

class AuditLogMiddleware:
    """
    Middleware to log all requests for security auditing purposes.
    Captures IP address, User ID (if authenticated), HTTP Method, and Path.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # We capture the request details before processing the view
        
        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        # Extract path and method
        path = request.path
        method = request.method
        
        # We can't definitively know the user at this point if they are using DRF SimpleJWT 
        # (since authentication happens in the view layer for DRF), 
        # but we can log the IP and endpoint.
        
        # Process the request
        response = self.get_response(request)
        
        # After response is generated, we might have `request.user` populated by some middleware, 
        # but DRF does it in the view. So we just log the status code and IP.
        
        user_identifier = request.user.email if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous'
        status_code = response.status_code
        
        log_message = f"User: {user_identifier} | IP: {ip} | Method: {method} | Path: {path} | Status: {status_code}"
        
        # Log to the audit trail
        logger.info(log_message)

        return response
