from .base import BaseAdapter
from .mongodb import MongoDatabase
import sys
import os

# Add src to path for absolute imports
_current_dir = os.path.dirname(os.path.abspath(__file__))
_src_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(_current_dir))), 'src')
if _src_dir not in sys.path:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(_current_dir))))


class DatabaseService:
    """Database service that manages database connections."""
    
    def __init__(self, db_config: dict = None):
        from src.configs.env import DB_TYPE, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
        
        if db_config:
            self.adapter = self._create_adapter_from_config(db_config, DB_TYPE, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
        else:
            self.adapter = self._create_default_adapter(DB_TYPE)
    
    def _create_adapter_from_config(self, config: dict, default_type: str, default_host: str, 
                                    default_port: int, default_dbname: str, default_user: str, default_password: str) -> BaseAdapter:
        """Create adapter from configuration."""
        db_type = config.get('type', default_type)
        
        if db_type == 'mongodb':
            return MongoDatabase(
                host=config.get('host', default_host),
                port=config.get('port', default_port),
                dbname=config.get('dbname', default_dbname),
                username=config.get('auth', {}).get('username') if config.get('auth') else default_user,
                password=config.get('auth', {}).get('password') if config.get('auth') else default_password,
            )
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    def _create_default_adapter(self, db_type: str) -> BaseAdapter:
        """Create default adapter from environment variables."""
        if db_type == 'mongodb':
            return MongoDatabase()
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    def connect(self) -> None:
        """Connect to the database."""
        self.adapter.connect()
    
    def disconnect(self) -> None:
        """Disconnect from the database."""
        self.adapter.disconnect()
    
    def get_adapter(self) -> BaseAdapter:
        """Get the database adapter."""
        return self.adapter

