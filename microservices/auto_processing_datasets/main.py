#!/usr/bin/env python3
"""
Main entry point for the auto-processing datasets microservice.
This service uses Celery for task management and listens to RabbitMQ events.
"""
import sys
import os
import signal
from pathlib import Path

# Add src to path for absolute imports
_current_dir = os.path.dirname(os.path.abspath(__file__))
_src_dir = os.path.join(_current_dir, 'src')
if _src_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from src.lib.database.service import DatabaseService
from src.events.listener import EventListener
from src.configs.env import (
    DB_TYPE, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD,
    STORAGE_DATASETS, STORAGE_CLEANED, STORAGE_ANALYSED
)
from src.utils.helpers import ensure_directory_exists
from src.utils.logger import setup_logger

# Setup logger
logger = setup_logger('listener', 'listener.log')


def main():
    """Bootstrap the microservice."""
    logger.info("=" * 60)
    logger.info("Starting Dallosh Analysis - Auto Processing Datasets Microservice")
    logger.info("Using Celery for task management")
    logger.info("=" * 60)

    try:
        # Build database configuration
        db_configs = {
            'type': DB_TYPE,
            'host': DB_HOST,
            'port': DB_PORT,
            'dbname': DB_NAME,
            'auth': {
                'username': DB_USER,
                'password': DB_PASSWORD
            } if DB_USER and DB_PASSWORD else None
        }

        logger.info(f"Database config: {db_configs['type']}://{db_configs['host']}:{db_configs['port']}/{db_configs['dbname']}")

        # Initialize database service
        logger.info("Connecting to database...")
        db_service = DatabaseService(db_configs)
        db_service.connect()
        db_adapter = db_service.get_adapter()
        logger.info("✓ Database connected")

        # Ensure storage directories exist
        logger.info("Ensuring storage directories exist...")
        ensure_directory_exists(STORAGE_DATASETS)
        ensure_directory_exists(STORAGE_CLEANED)
        ensure_directory_exists(STORAGE_ANALYSED)
        logger.info(f"  - Datasets: {STORAGE_DATASETS}")
        logger.info(f"  - Cleaned: {STORAGE_CLEANED}")
        logger.info(f"  - Analysed: {STORAGE_ANALYSED}")

        # Check if Celery worker is running
        logger.info("Checking Celery worker status...")
        from src.utils.worker_check import check_celery_worker
        worker_status = check_celery_worker()
        if not worker_status['running']:
            logger.warning("⚠ WARNING: No Celery workers detected!")
            logger.warning("  Please start the worker in another terminal:")
            logger.warning("  make worker")
            logger.warning("  Or: celery -A src.celery_app worker --loglevel=info --queues=auto_processing_queue")
        else:
            logger.info(f"✓ Celery worker detected: {worker_status['workers']} worker(s) active")
            logger.info(f"  Registered tasks: {', '.join(worker_status.get('tasks', []))}")

        # Initialize event listener (dispatches Celery tasks)
        logger.info("Connecting to RabbitMQ...")
        event_listener = EventListener(db_adapter=db_adapter, logger=logger)
        event_listener.connect()
        logger.info("✓ RabbitMQ connected")

        # Setup signal handlers for graceful shutdown
        def signal_handler(signum, frame):
            logger.info(f"\nReceived signal {signum}, shutting down gracefully...")
            event_listener.stop_listening()
            db_service.disconnect()
            logger.info("Shutdown complete")
            sys.exit(0)

        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

        # Start listening to events
        logger.info("\n" + "=" * 60)
        logger.info("Microservice is running.")
        logger.info("Logs are being written to: logs/listener.log")
        logger.info("Press Ctrl+C to stop.")
        logger.info("=" * 60 + "\n")

        event_listener.start_listening()

    except KeyboardInterrupt:
        logger.info("\nShutting down...")
        if 'db_service' in locals():
            db_service.disconnect()
        if 'event_listener' in locals():
            event_listener.stop_listening()
        logger.info("Shutdown complete")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
