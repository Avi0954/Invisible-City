from abc import ABC, abstractmethod


class BaseStorageProvider(ABC):
    """Abstract interface for object / file storage providers."""

    @abstractmethod
    def upload_file(self, file_bytes: bytes, filename: str, content_type: str) -> str:
        """Uploads file bytes and returns accessible URL or storage reference."""
        pass

    @abstractmethod
    def delete_file(self, file_url_or_key: str) -> bool:
        """Deletes specified file from storage provider."""
        pass
