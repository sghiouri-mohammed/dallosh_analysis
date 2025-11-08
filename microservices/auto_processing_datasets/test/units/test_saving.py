"""Unit tests for saving service."""
import pytest
import pandas as pd
import os
import tempfile
import shutil
from unittest.mock import Mock, patch
from datetime import datetime

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))

from src.services.saving import saving
from src.configs.constants import (
    TASK_STATUS_SAVING_FILE,
    TASK_STATUS_SAVING_FILE_DONE,
    TASK_STATUS_DONE,
)


class TestSaving:
    """Test cases for saving function."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for test files."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def sample_dataframe(self):
        """Create sample DataFrame for testing."""
        return pd.DataFrame({
            'id': [1, 2, 3],
            'full_text': ['Text 1', 'Text 2', 'Text 3'],
            'sentiment': ['positive', 'negative', 'neutral']
        })
    
    @pytest.fixture
    def mock_event_emitter(self):
        """Create mock event emitter."""
        return Mock()
    
    @pytest.fixture
    def mock_db_adapter(self):
        """Create mock database adapter."""
        adapter = Mock()
        adapter.update_one = Mock()
        return adapter
    
    @patch('src.services.saving.STORAGE_ANALYSED', new_callable=lambda: '/tmp/test_analysed')
    def test_saving_saves_file(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter):
        """Test that saving saves the DataFrame to CSV."""
        with patch('src.services.saving.STORAGE_ANALYSED', temp_dir):
            file_path = saving('test_file_123', sample_dataframe, mock_event_emitter)
            
            # Check that file was saved
            assert os.path.exists(file_path)
            assert file_path.endswith('test_file_123.csv')
            
            # Verify file content
            loaded_df = pd.read_csv(file_path)
            assert len(loaded_df) == len(sample_dataframe)
            assert list(loaded_df.columns) == list(sample_dataframe.columns)
    
    @patch('src.services.saving.STORAGE_ANALYSED', new_callable=lambda: '/tmp/test_analysed')
    def test_saving_emits_events(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter):
        """Test that saving emits correct events."""
        with patch('src.services.saving.STORAGE_ANALYSED', temp_dir):
            saving('test_file_123', sample_dataframe, mock_event_emitter)
            
            # Check that events were emitted
            assert mock_event_emitter.called
            calls = [call[0] for call in mock_event_emitter.call_args_list]
            assert ('test_file_123', TASK_STATUS_SAVING_FILE) in calls
            assert any(call[0] == 'test_file_123' and call[1] == TASK_STATUS_SAVING_FILE_DONE 
                      for call in mock_event_emitter.call_args_list)
            assert ('test_file_123', TASK_STATUS_DONE) in calls
    
    @patch('src.services.saving.STORAGE_ANALYSED', new_callable=lambda: '/tmp/test_analysed')
    def test_saving_updates_database(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter, mock_db_adapter):
        """Test that saving updates database with file path."""
        with patch('src.services.saving.STORAGE_ANALYSED', temp_dir):
            saving('test_file_123', sample_dataframe, mock_event_emitter, mock_db_adapter)
            
            # Check that database was updated
            assert mock_db_adapter.update_one.called
            call_args = mock_db_adapter.update_one.call_args
            assert call_args[0][0] == 'tasks'
            assert 'data.file_analysed.path' in call_args[0][2]
            assert 'data.file_analysed.type' in call_args[0][2]
    
    @patch('src.services.saving.STORAGE_ANALYSED', new_callable=lambda: '/tmp/test_analysed')
    def test_saving_returns_path(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter):
        """Test that saving returns the file path."""
        with patch('src.services.saving.STORAGE_ANALYSED', temp_dir):
            file_path = saving('test_file_123', sample_dataframe, mock_event_emitter)
            
            assert isinstance(file_path, str)
            assert file_path.endswith('test_file_123.csv')
            assert os.path.exists(file_path)
    
    @patch('src.services.saving.STORAGE_ANALYSED', new_callable=lambda: '/tmp/test_analysed')
    def test_saving_handles_empty_dataframe(self, mock_storage, temp_dir, mock_event_emitter):
        """Test saving with empty DataFrame."""
        df = pd.DataFrame()
        
        with patch('src.services.saving.STORAGE_ANALYSED', temp_dir):
            file_path = saving('test_file_123', df, mock_event_emitter)
            assert os.path.exists(file_path)
            
            # Verify empty file
            loaded_df = pd.read_csv(file_path)
            assert len(loaded_df) == 0
    
    @patch('src.services.saving.STORAGE_ANALYSED', new_callable=lambda: '/tmp/test_analysed')
    def test_saving_without_db_adapter(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter):
        """Test saving without database adapter."""
        with patch('src.services.saving.STORAGE_ANALYSED', temp_dir):
            file_path = saving('test_file_123', sample_dataframe, mock_event_emitter, None)
            
            # Should still save file
            assert os.path.exists(file_path)
            assert mock_event_emitter.called

