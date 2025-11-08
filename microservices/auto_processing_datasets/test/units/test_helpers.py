"""Unit tests for helper utility functions."""
import pytest
import os
import tempfile
import shutil
from pathlib import Path

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))

from src.utils.helpers import ensure_directory_exists, get_file_id_from_path


class TestEnsureDirectoryExists:
    """Test cases for ensure_directory_exists function."""
    
    def test_creates_new_directory(self, tmp_path):
        """Test that function creates a new directory."""
        new_dir = os.path.join(tmp_path, 'new_directory')
        ensure_directory_exists(new_dir)
        assert os.path.exists(new_dir)
        assert os.path.isdir(new_dir)
    
    def test_creates_nested_directories(self, tmp_path):
        """Test that function creates nested directories."""
        nested_dir = os.path.join(tmp_path, 'level1', 'level2', 'level3')
        ensure_directory_exists(nested_dir)
        assert os.path.exists(nested_dir)
        assert os.path.isdir(nested_dir)
    
    def test_handles_existing_directory(self, tmp_path):
        """Test that function handles existing directory gracefully."""
        existing_dir = os.path.join(tmp_path, 'existing')
        os.makedirs(existing_dir, exist_ok=True)
        
        # Should not raise error
        ensure_directory_exists(existing_dir)
        assert os.path.exists(existing_dir)
    
    def test_handles_absolute_paths(self):
        """Test that function handles absolute paths."""
        temp_dir = tempfile.mkdtemp()
        try:
            new_dir = os.path.join(temp_dir, 'test_dir')
            ensure_directory_exists(new_dir)
            assert os.path.exists(new_dir)
        finally:
            shutil.rmtree(temp_dir)
    
    def test_handles_relative_paths(self, tmp_path):
        """Test that function handles relative paths."""
        os.chdir(tmp_path)
        relative_dir = 'relative_test_dir'
        ensure_directory_exists(relative_dir)
        assert os.path.exists(relative_dir)


class TestGetFileIdFromPath:
    """Test cases for get_file_id_from_path function."""
    
    def test_extracts_file_id_from_simple_path(self):
        """Test extracting file ID from simple path."""
        file_path = '/path/to/file_123.csv'
        file_id = get_file_id_from_path(file_path)
        assert file_id == 'file_123'
    
    def test_extracts_file_id_from_complex_path(self):
        """Test extracting file ID from complex path."""
        file_path = '/storage/datasets/subfolder/test_file_abc.csv'
        file_id = get_file_id_from_path(file_path)
        assert file_id == 'test_file_abc'
    
    def test_handles_path_without_extension(self):
        """Test extracting file ID from path without extension."""
        file_path = '/path/to/file_123'
        file_id = get_file_id_from_path(file_path)
        assert file_id == 'file_123'
    
    def test_handles_path_with_multiple_dots(self):
        """Test extracting file ID from path with multiple dots."""
        file_path = '/path/to/file.name.123.csv'
        file_id = get_file_id_from_path(file_path)
        assert file_id == 'file.name.123'
    
    def test_handles_windows_path(self):
        """Test extracting file ID from Windows path."""
        file_path = 'C:\\Users\\Test\\file_123.csv'
        file_id = get_file_id_from_path(file_path)
        assert file_id == 'file_123'
    
    def test_handles_relative_path(self):
        """Test extracting file ID from relative path."""
        file_path = 'datasets/test_file.csv'
        file_id = get_file_id_from_path(file_path)
        assert file_id == 'test_file'
    
    def test_handles_filename_only(self):
        """Test extracting file ID from filename only."""
        file_path = 'file_123.csv'
        file_id = get_file_id_from_path(file_path)
        assert file_id == 'file_123'

