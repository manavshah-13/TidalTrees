from slowapi import Limiter
from slowapi.util import get_remote_address

# Configure global SlowAPI Limiter using client IP
limiter = Limiter(key_func=get_remote_address)
