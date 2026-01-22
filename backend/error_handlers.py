from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handle HTTP exceptions with standardized error responses
    """
    logger.warning(f"HTTP Exception: {exc.status_code} - {exc.detail}")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail if hasattr(exc, 'detail') else "An error occurred"
            }
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors with standardized error responses
    """
    logger.warning(f"Validation Error: {exc.errors()}")

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
                "details": exc.errors()
            }
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle general exceptions with standardized error responses
    """
    logger.error(f"General Exception: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal server error occurred"
            }
        }
    )