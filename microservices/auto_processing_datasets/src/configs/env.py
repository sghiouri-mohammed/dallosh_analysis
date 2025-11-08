"""Environment variables configuration."""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DB_TYPE = os.getenv('DB_TYPE', 'mongodb')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '27017'))
DB_NAME = os.getenv('DB_NAME', 'dallosh_analysis')
DB_USER = os.getenv('DB_USER', '')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

# RabbitMQ configuration
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672/')
RABBITMQ_TOPIC_TASKS = os.getenv('RABBITMQ_TOPIC_TASKS', 'tasks')  # Must match backend

# Storage paths
STORAGE_PATH = os.getenv('STORAGE_PATH', os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'storage'))
STORAGE_DATASETS = os.getenv('STORAGE_DATASETS', os.path.join(STORAGE_PATH, 'datasets'))
STORAGE_CLEANED = os.getenv('STORAGE_CLEANED', os.path.join(STORAGE_PATH, 'cleaned'))
STORAGE_ANALYSED = os.getenv('STORAGE_ANALYSED', os.path.join(STORAGE_PATH, 'analysed'))

# LLM processing defaults
DEFAULT_PAGINATE_ROWS_LIMIT = int(os.getenv('DEFAULT_PAGINATE_ROWS_LIMIT', '500'))
DEFAULT_RETRY_REQUESTS = int(os.getenv('DEFAULT_RETRY_REQUESTS', '3'))
MAX_PAGINATE_ROWS_LIMIT = int(os.getenv('MAX_PAGINATE_ROWS_LIMIT', '1000'))
MAX_RETRY_REQUESTS = int(os.getenv('MAX_RETRY_REQUESTS', '5'))

