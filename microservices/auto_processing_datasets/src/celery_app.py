"""Celery application configuration."""
from celery import Celery
from celery.signals import setup_logging
import logging
from src.configs.env import RABBITMQ_URL
from src.utils.logger import setup_logger

# Setup logger for Celery
celery_logger = setup_logger('celery', 'worker.log')

# Create Celery app
celery_app = Celery(
    'dallosh_analysis',
    broker=RABBITMQ_URL,
    backend='rpc://',  # Use RabbitMQ as result backend too
    include=['src.tasks.processor']
)

# Celery configuration
import sys

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    task_soft_time_limit=3300,  # 55 minutes soft limit
    worker_prefetch_multiplier=1,  # Process one task at a time
    task_acks_late=True,  # Acknowledge after task completion
    task_reject_on_worker_lost=True,
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
    worker_log_format='[%(asctime)s: %(levelname)s/%(processName)s] %(message)s',
    worker_task_log_format='[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s',
)

# Use solo pool on Windows (prefork doesn't work on Windows)
if sys.platform == 'win32':
    celery_app.conf.worker_pool = 'solo'

# Task routing - use different queue name to avoid conflict with event listener
celery_app.conf.task_routes = {
    'src.tasks.processor.process_dataset': {'queue': 'celery_processing_queue'},
    'src.tasks.processor.retry_dataset_step': {'queue': 'celery_processing_queue'},
}

if __name__ == '__main__':
    celery_app.start()

