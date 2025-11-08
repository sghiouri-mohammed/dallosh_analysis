"""Unit tests for reading_file service."""
import pytest
import pandas as pd
import os
import tempfile
import shutil
from unittest.mock import Mock, patch

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))

from src.services.reading_file import reading_file
from src.configs.constants import (
    TASK_STATUS_READING_DATASET,
    TASK_STATUS_READING_DATASET_DONE,
)


class TestReadingFile:
    """Test cases for reading_file function."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for test files."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def sample_csv_file(self, temp_dir):
        """Create a sample CSV file for testing."""
        file_path = os.path.join(temp_dir, 'test_file_123.csv')
        df = pd.DataFrame({
            'id': [1, 2, 3],
            'full_text': ['Text 1', 'Text 2', 'Text 3'],
            'user_id': [100, 200, 300]
        })
        df.to_csv(file_path, index=False)
        return file_path
    
    @pytest.fixture
    def mock_event_emitter(self):
        """Create mock event emitter."""
        return Mock()
    
    def test_reading_file_success(self, sample_csv_file, mock_event_emitter):
        """Test successful file reading."""
        file_id, df = reading_file(sample_csv_file, mock_event_emitter)
        
        # Check file_id extraction
        assert file_id == 'test_file_123'
        
        # Check DataFrame content
        assert len(df) == 3
        assert 'id' in df.columns
        assert 'full_text' in df.columns
        assert 'user_id' in df.columns
    
    def test_reading_file_emits_events(self, sample_csv_file, mock_event_emitter):
        """Test that reading_file emits correct events."""
        reading_file(sample_csv_file, mock_event_emitter)
        
        # Check that events were emitted
        assert mock_event_emitter.called
        calls = [call[0] for call in mock_event_emitter.call_args_list]
        assert ('test_file_123', TASK_STATUS_READING_DATASET) in calls
        assert any(call[0] == 'test_file_123' and call[1] == TASK_STATUS_READING_DATASET_DONE 
                  for call in mock_event_emitter.call_args_list)
    
    def test_reading_file_metadata_in_event(self, sample_csv_file, mock_event_emitter):
        """Test that reading_file includes metadata in done event."""
        reading_file(sample_csv_file, mock_event_emitter)
        
        # Find the done event call
        done_call = None
        for call in mock_event_emitter.call_args_list:
            if len(call[0]) >= 2 and call[0][1] == TASK_STATUS_READING_DATASET_DONE:
                done_call = call
                break
        
        assert done_call is not None
        # Check metadata
        if len(done_call[0]) > 2:
            metadata = done_call[0][2]
            assert 'rows' in metadata
            assert 'columns' in metadata
            assert metadata['rows'] == 3
            assert metadata['columns'] == 3
    
    def test_reading_file_nonexistent_file(self, mock_event_emitter):
        """Test reading_file with non-existent file."""
        with pytest.raises(FileNotFoundError):
            reading_file('/nonexistent/path/file.csv', mock_event_emitter)
    
    def test_reading_file_extracts_file_id(self, sample_csv_file, mock_event_emitter):
        """Test that file_id is correctly extracted from path."""
        file_id, _ = reading_file(sample_csv_file, mock_event_emitter)
        assert file_id == 'test_file_123'
        
        # Test with different path format
        file_path = '/some/path/to/file_abc.csv'
        file_id, _ = reading_file(file_path, mock_event_emitter)
        assert file_id == 'file_abc'

