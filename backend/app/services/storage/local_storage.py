import os
import uuid
from pathlib import Path
from app.services.storage.base import BaseStorageProvider
from app.core.config import settings
from app.core.logging import logger


class LocalStorageProvider(BaseStorageProvider):
    """Local filesystem implementation for dev / MVP object storage."""

    def __init__(self):
        self.upload_dir = Path(settings.STORAGE_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def upload_file(self, file_bytes: bytes, filename: str, content_type: str) -> str:
        # Extract extension safely
        ext = os.path.splitext(filename)[1].lower()
        if not ext:
            ext = ".jpg"
            
        # Generate secure random UUID filename to prevent directory traversal / shell execution
        secure_name = f"{uuid.uuid4()}{ext}"
        destination_path = self.upload_dir / secure_name

        with open(destination_path, "wb") as f:
            f.write(file_bytes)

        logger.info(f"Stored file locally: {destination_path}")
        return f"/uploads/{secure_name}"

    def delete_file(self, file_url_or_key: str) -> bool:
        filename = os.path.basename(file_url_or_key)
        target_path = self.upload_dir / filename
        if target_path.exists():
            try:
                os.remove(target_path)
                logger.info(f"Deleted file locally: {target_path}")
                return True
            except Exception as e:
                logger.error(f"Failed to delete file {target_path}: {e}")
                return False
        return False
