from pymongo import MongoClient
from typing import Optional
from ..base import BaseAdapter
import sys
import os

# Add src to path for absolute imports
_current_dir = os.path.dirname(os.path.abspath(__file__))
_src_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(_current_dir))), 'src')
if _src_dir not in sys.path:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(_current_dir))))


class MongoDatabase(BaseAdapter):
    """MongoDB adapter implementation."""
    
    def __init__(self, host: str = None, port: int = None, dbname: str = None, 
                 username: str = None, password: str = None):
        from src.configs.env import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
        self.host = host or DB_HOST
        self.port = port or DB_PORT
        self.dbname = dbname or DB_NAME
        self.username = username or DB_USER
        self.password = password or DB_PASSWORD
        self.client: Optional[MongoClient] = None
        self.db = None
    
    def _build_connection_uri(self) -> str:
        """Build MongoDB connection URI."""
        if self.username and self.password:
            return f"mongodb://{self.username}:{self.password}@{self.host}:{self.port}/{self.dbname}"
        else:
            return f"mongodb://{self.host}:{self.port}/{self.dbname}"
    
    def connect(self) -> None:
        """Connect to MongoDB."""
        try:
            uri = self._build_connection_uri()
            self.client = MongoClient(uri)
            self.db = self.client[self.dbname]
            print(f"Connected to MongoDB: {self.host}:{self.port}/{self.dbname}")
        except Exception as error:
            print(f"MongoDB connection error: {error}")
            raise
    
    def disconnect(self) -> None:
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            print("Disconnected from MongoDB")
    
    def find_one(self, collection: str, filter: dict) -> dict | None:
        """Find one document in a collection."""
        if self.db is None:
            raise Exception("Database not connected")
        return self.db[collection].find_one(filter)
    
    def update_one(self, collection: str, filter: dict, update: dict) -> None:
        """Update one document in a collection."""
        if self.db is None:
            raise Exception("Database not connected")
        self.db[collection].update_one(filter, {"$set": update})

