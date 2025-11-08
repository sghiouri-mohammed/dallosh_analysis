"""Helper utility functions."""
import os
from pathlib import Path


def ensure_directory_exists(directory_path: str) -> None:
    """
    Ensure a directory exists, create it if it doesn't.
    
    Args:
        directory_path: Path to the directory
    """
    Path(directory_path).mkdir(parents=True, exist_ok=True)


def get_file_id_from_path(file_path: str) -> str:
    """
    Extract file ID from file path.
    
    Args:
        file_path: Path to the file (e.g., /path/to/storage/datasets/file_id.csv)
    
    Returns:
        File ID (filename without extension)
    """
    filename = os.path.basename(file_path)
    file_id = os.path.splitext(filename)[0]
    return file_id

