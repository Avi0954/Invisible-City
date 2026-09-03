import io
import os
from PIL import Image
from fastapi import UploadFile, status
from app.core.config import settings
from app.core.exceptions import InvisibleCityException


def validate_image_upload(file: UploadFile, file_bytes: bytes) -> str:
    """
    Validates uploaded file MIME type, file extension, max size, and image integrity.
    Returns cleaned file extension (e.g. '.jpg').
    """
    # 1. Size Validation
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise InvisibleCityException(
            message=f"File size exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB}MB.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    if len(file_bytes) == 0:
        raise InvisibleCityException(
            message="Uploaded file is empty.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # 2. Content Type / MIME Validation
    content_type = file.content_type or ""
    if content_type.lower() not in settings.ALLOWED_IMAGE_MIMES:
        raise InvisibleCityException(
            message=f"Invalid MIME type '{content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_MIMES)}",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # 3. Extension Validation
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise InvisibleCityException(
            message=f"Invalid file extension '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # 4. Image Integrity & Dimension Validation using Pillow
    try:
        with Image.open(io.BytesIO(file_bytes)) as img:
            img.verify()  # Verifies file header and integrity
            width, height = img.size
            if width <= 0 or height <= 0:
                raise ValueError("Invalid dimensions")
    except Exception as e:
        raise InvisibleCityException(
            message="Uploaded file is not a valid image or is corrupted.",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"error": str(e)}
        )

    return ext
