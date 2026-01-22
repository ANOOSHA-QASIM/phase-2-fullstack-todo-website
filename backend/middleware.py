from fastapi import Request, HTTPException, status
from collections import defaultdict
import time
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, requests: int, window: int):
        """
        Initialize rate limiter
        :param requests: Number of requests allowed
        :param window: Time window in seconds
        """
        self.requests = requests
        self.window = window
        self.requests_log = defaultdict(list)

    def is_allowed(self, identifier: str) -> bool:
        """
        Check if request is allowed based on rate limit
        :param identifier: Unique identifier for the client (IP, user ID, etc.)
        :return: True if allowed, False if rate limited
        """
        now = time.time()
        # Clean old requests outside the window
        self.requests_log[identifier] = [
            req_time for req_time in self.requests_log[identifier]
            if now - req_time < self.window
        ]

        # Check if limit is reached
        if len(self.requests_log[identifier]) >= self.requests:
            return False

        # Add current request to log
        self.requests_log[identifier].append(now)
        return True

# Global rate limiter instance for auth endpoints (10 requests per minute)
auth_rate_limiter = RateLimiter(requests=10, window=60)