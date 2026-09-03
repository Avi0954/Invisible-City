import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware that assigns a unique Request ID to each incoming HTTP request,
    storing it on request state and returning it in the X-Request-ID response header.
    """
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
