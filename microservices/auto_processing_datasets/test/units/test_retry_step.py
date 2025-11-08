"""Unit tests for retry_step service."""
import pytest
import pandas as pd
import os
import tempfile
import shutil
from unittest.mock import Mock, patch, MagicMock

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))

from src.services.retry_step import retry_step
from src.configs.constants import (
    TASK_STATUS_IN_QUEUE,
    TASK_STATUS_READING_DATASET,
    TASK_STATUS_PROCESS_CLEANING,
    TASK_STATUS_SENDING_TO_LLM,
    TASK_STATUS_APPENDING_COLUMNS,
    TASK_STATUS_SAVING_FILE,
)


class TestRetryStep:
    """Test cases for retry_step function."""
    
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
            'id': [1, 2],
            'full_text': ['Text 1', 'Text 2']
        })
        df.to_csv(file_path, index=False)
        return file_path
    
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
    
    @pytest.fixture
    def sample_ai_config(self):
        """Create sample AI configuration."""
        return {
            'preferences': {'mode': 'local'},
            'local': [{'uid': 'local1', 'data': {'model': 'llama3', 'baseUrl': 'http://localhost:11434'}}]
        }
    
    @patch('src.services.retry_step.calling_llm')
    @patch('src.services.retry_step.cleaning')
    @patch('src.services.retry_step.reading_file')
    def test_retry_step_from_in_queue(self, mock_read, mock_clean, mock_llm,
                                      sample_csv_file, sample_ai_config, 
                                      mock_event_emitter, mock_db_adapter):
        """Test retry_step starting from in_queue."""
        mock_read.return_value = ('test_file_123', pd.DataFrame({'id': [1], 'full_text': ['Text']}))
        mock_clean.return_value = pd.DataFrame({'id': [1], 'full_text': ['Text']})
        mock_llm.return_value = (pd.DataFrame({'id': [1], 'full_text': ['Text']}), 'local1')
        
        retry_step(
            'test_file_123',
            TASK_STATUS_IN_QUEUE,
            sample_csv_file,
            sample_ai_config,
            mock_db_adapter,
            mock_event_emitter
        )
        
        # Should execute all steps
        assert mock_read.called
        assert mock_clean.called
        assert mock_llm.called
    
    @patch('src.services.retry_step.calling_llm')
    @patch('src.services.retry_step.cleaning')
    @patch('src.services.retry_step.reading_file')
    def test_retry_step_from_reading_done(self, mock_read, mock_clean, mock_llm,
                                          sample_csv_file, sample_ai_config,
                                          mock_event_emitter, mock_db_adapter):
        """Test retry_step starting from reading_dataset done."""
        mock_clean.return_value = pd.DataFrame({'id': [1], 'full_text': ['Text']})
        mock_llm.return_value = (pd.DataFrame({'id': [1], 'full_text': ['Text']}), 'local1')
        
        retry_step(
            'test_file_123',
            TASK_STATUS_READING_DATASET,
            sample_csv_file,
            sample_ai_config,
            mock_db_adapter,
            mock_event_emitter
        )
        
        # Should skip reading, start from cleaning
        assert not mock_read.called
        assert mock_clean.called
        assert mock_llm.called
    
    @patch('src.services.retry_step.calling_llm')
    @patch('src.services.retry_step.cleaning')
    @patch('src.services.retry_step.reading_file')
    def test_retry_step_from_cleaning_done(self, mock_read, mock_clean, mock_llm,
                                           sample_csv_file, sample_ai_config,
                                           mock_event_emitter, mock_db_adapter):
        """Test retry_step starting from cleaning done."""
        mock_llm.return_value = (pd.DataFrame({'id': [1], 'full_text': ['Text']}), 'local1')
        
        retry_step(
            'test_file_123',
            TASK_STATUS_PROCESS_CLEANING,
            sample_csv_file,
            sample_ai_config,
            mock_db_adapter,
            mock_event_emitter
        )
        
        # Should skip reading and cleaning, start from LLM
        assert not mock_read.called
        assert not mock_clean.called
        assert mock_llm.called

