"""Logging configuration for the microservice."""
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

# Get logs directory (relative to project root)
_current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_logs_dir = os.path.join(_current_dir, 'logs')


def setup_logger(name: str, log_file: str = None, level: int = logging.INFO):
    """
    Set up a logger with both file and console handlers.
    
    Args:
        name: Logger name
        log_file: Log file name (will be placed in logs/ directory)
        level: Logging level
    
    Returns:
        Logger instance
    """
    # Ensure logs directory exists
    os.makedirs(_logs_dir, exist_ok=True)
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Remove existing handlers to avoid duplicates
    logger.handlers = []
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )
    
    # File handler
    if log_file:
        log_path = os.path.join(_logs_dir, log_file)
        file_handler = logging.FileHandler(log_path, encoding='utf-8')
        file_handler.setLevel(level)
        file_handler.setFormatter(detailed_formatter)
        logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    return logger


def get_log_file_path(log_file: str) -> str:
    """Get full path to a log file."""
    return os.path.join(_logs_dir, log_file)

