import logging
import sys
from datetime import datetime
from typing import Dict, Any

# Create a custom formatter
class CustomFormatter(logging.Formatter):
    def format(self, record):
        # Add timestamp with microseconds
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

        # Define log format
        log_format = f"[%(levelname)s] [{timestamp}] %(name)s: %(message)s"

        formatter = logging.Formatter(log_format)
        return formatter.format(record)

# Configure root logger
def setup_logging():
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Prevent adding handlers multiple times
    if logger.handlers:
        return logger

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    # Create file handler
    file_handler = logging.FileHandler('app.log')
    file_handler.setLevel(logging.INFO)

    # Create formatter and add it to handlers
    formatter = CustomFormatter()
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    # Add handlers to logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger

# Initialize logging
logger = setup_logging()