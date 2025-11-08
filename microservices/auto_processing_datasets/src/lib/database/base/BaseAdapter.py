from abc import ABC, abstractmethod


class BaseAdapter(ABC):
    """Base adapter interface for database operations."""
    
    @abstractmethod
    def connect(self) -> None:
        """Connect to the database."""
        pass
    
    @abstractmethod
    def disconnect(self) -> None:
        """Disconnect from the database."""
        pass
    
    @abstractmethod
    def find_one(self, collection: str, filter: dict) -> dict | None:
        """Find one document in a collection."""
        pass
    
    @abstractmethod
    def update_one(self, collection: str, filter: dict, update: dict) -> None:
        """Update one document in a collection."""
        pass

