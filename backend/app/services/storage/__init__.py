from app.services.storage.base import BaseStorageProvider
from app.services.storage.local_storage import LocalStorageProvider
from app.core.config import settings

_storage_instance = None


def get_storage_provider() -> BaseStorageProvider:
    """Factory retrieving active storage provider instance based on environment settings."""
    global _storage_instance
    if _storage_instance is None:
        if settings.STORAGE_PROVIDER == "local":
            _storage_instance = LocalStorageProvider()
        else:
            # Default fallback to LocalStorageProvider
            _storage_instance = LocalStorageProvider()
    return _storage_instance
