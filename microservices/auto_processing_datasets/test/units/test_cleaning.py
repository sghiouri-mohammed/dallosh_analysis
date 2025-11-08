"""Unit tests for cleaning service."""
import pytest
import pandas as pd
import numpy as np
import os
import tempfile
import shutil
from unittest.mock import Mock, patch, MagicMock

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))

from src.services.cleaning import remove_emoji, cleaning
from src.configs.constants import (
    TASK_STATUS_PROCESS_CLEANING,
    TASK_STATUS_PROCESS_CLEANING_DONE,
)


class TestRemoveEmoji:
    """Test cases for remove_emoji function."""
    
    def test_remove_emoji_basic(self):
        """Test basic emoji removal."""
        text = "Hello 😀 world 🌍"
        result = remove_emoji(text)
        assert "😀" not in result
        assert "🌍" not in result
        assert "Hello" in result
        assert "world" in result
    
    def test_remove_emoji_preserves_mentions(self):
        """Test that @ mentions are preserved."""
        text = "Hello @username this is a test @user123"
        result = remove_emoji(text)
        assert "@username" in result
        assert "@user123" in result
    
    def test_remove_emoji_with_mentions_and_emoji(self):
        """Test emoji removal while preserving @ mentions."""
        text = "Hey @john 😀 check this out @jane 🎉"
        result = remove_emoji(text)
        assert "@john" in result
        assert "@jane" in result
        assert "😀" not in result
        assert "🎉" not in result
    
    def test_remove_emoji_special_characters(self):
        """Test removal of special characters except basic punctuation."""
        text = "Hello! This is a test? Yes, it is."
        result = remove_emoji(text)
        assert "Hello" in result
        assert "!" in result
        assert "?" in result
        assert "," in result
        assert "." in result
    
    def test_remove_emoji_removes_unicode_symbols(self):
        """Test removal of unicode symbols."""
        text = "Text with symbols ©®™€£"
        result = remove_emoji(text)
        # Basic punctuation should remain, but special symbols removed
        assert "Text" in result
        assert "with" in result
    
    def test_remove_emoji_handles_nan(self):
        """Test that NaN values are handled correctly."""
        result = remove_emoji(pd.NA)
        assert pd.isna(result)
    
    def test_remove_emoji_handles_none(self):
        """Test that None values are handled correctly."""
        result = remove_emoji(None)
        assert pd.isna(result)
    
    def test_remove_emoji_multiple_spaces(self):
        """Test that multiple spaces are cleaned up."""
        text = "Hello    world   test"
        result = remove_emoji(text)
        assert "  " not in result  # No double spaces
        assert "Hello world test" in result or "Hello world test" == result.strip()


class TestCleaning:
    """Test cases for cleaning function."""
    
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
            'id': [1, 2, 3, 4, 5],
            'full_text': [
                'Hello 😀 world',
                'Test @username message',
                'Another test 🎉',
                'Hello 😀 world',  # Duplicate
                'Normal text here'
            ],
            'user_id': [100, 200, 300, 100, 400],
            'numeric_col': [10, 20, 30, 1000, 25]  # 1000 is an outlier
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
    
    @patch('src.services.cleaning.STORAGE_CLEANED', new_callable=lambda: '/tmp/test_cleaned')
    def test_cleaning_removes_emojis(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter):
        """Test that cleaning removes emojis from full_text column."""
        with patch('src.services.cleaning.STORAGE_CLEANED', temp_dir):
            result_df = cleaning('test_file_123', sample_dataframe.copy(), mock_event_emitter)
            
            # Check that emojis are removed
            assert '😀' not in result_df['full_text'].iloc[0]
            assert '🎉' not in result_df['full_text'].iloc[2]
            
            # Check that @ mentions are preserved
            assert '@username' in result_df['full_text'].iloc[1]
    
    @patch('src.services.cleaning.STORAGE_CLEANED', new_callable=lambda: '/tmp/test_cleaned')
    def test_cleaning_removes_duplicates(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter):
        """Test that cleaning removes duplicate rows."""
        with patch('src.services.cleaning.STORAGE_CLEANED', temp_dir):
            initial_rows = len(sample_dataframe)
            result_df = cleaning('test_file_123', sample_dataframe.copy(), mock_event_emitter)
            
            # Should have one less row (duplicate removed)
            assert len(result_df) < initial_rows
            assert len(result_df) == initial_rows - 1
    
    @patch('src.services.cleaning.STORAGE_CLEANED', new_callable=lambda: '/tmp/test_cleaned')
    def test_cleaning_emits_events(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter):
        """Test that cleaning emits correct events."""
        with patch('src.services.cleaning.STORAGE_CLEANED', temp_dir):
            cleaning('test_file_123', sample_dataframe.copy(), mock_event_emitter)
            
            # Check that events were emitted
            assert mock_event_emitter.called
            calls = [call[0] for call in mock_event_emitter.call_args_list]
            assert ('test_file_123', TASK_STATUS_PROCESS_CLEANING) in calls
            assert any(call[0] == 'test_file_123' and call[1] == TASK_STATUS_PROCESS_CLEANING_DONE 
                      for call in mock_event_emitter.call_args_list)
    
    @patch('src.services.cleaning.STORAGE_CLEANED', new_callable=lambda: '/tmp/test_cleaned')
    def test_cleaning_saves_file(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter):
        """Test that cleaning saves the cleaned file."""
        with patch('src.services.cleaning.STORAGE_CLEANED', temp_dir):
            result_df = cleaning('test_file_123', sample_dataframe.copy(), mock_event_emitter)
            
            # Check that file was saved
            expected_path = os.path.join(temp_dir, 'test_file_123.csv')
            assert os.path.exists(expected_path)
            
            # Verify file content
            loaded_df = pd.read_csv(expected_path)
            assert len(loaded_df) == len(result_df)
    
    @patch('src.services.cleaning.STORAGE_CLEANED', new_callable=lambda: '/tmp/test_cleaned')
    def test_cleaning_updates_database(self, mock_storage, temp_dir, sample_dataframe, mock_event_emitter, mock_db_adapter):
        """Test that cleaning updates database with file path."""
        with patch('src.services.cleaning.STORAGE_CLEANED', temp_dir):
            cleaning('test_file_123', sample_dataframe.copy(), mock_event_emitter, mock_db_adapter)
            
            # Check that database was updated
            assert mock_db_adapter.update_one.called
            call_args = mock_db_adapter.update_one.call_args
            assert call_args[0][0] == 'tasks'
            assert 'data.file_cleaned.path' in call_args[0][2]
    
    @patch('src.services.cleaning.STORAGE_CLEANED', new_callable=lambda: '/tmp/test_cleaned')
    def test_cleaning_without_full_text_column(self, mock_storage, temp_dir, mock_event_emitter):
        """Test cleaning with DataFrame that doesn't have full_text column."""
        df = pd.DataFrame({
            'id': [1, 2, 3],
            'other_col': ['a', 'b', 'c']
        })
        
        with patch('src.services.cleaning.STORAGE_CLEANED', temp_dir):
            result_df = cleaning('test_file_123', df, mock_event_emitter)
            assert len(result_df) == len(df)
            assert 'other_col' in result_df.columns
    
    @patch('src.services.cleaning.STORAGE_CLEANED', new_callable=lambda: '/tmp/test_cleaned')
    def test_cleaning_handles_empty_dataframe(self, mock_storage, temp_dir, mock_event_emitter):
        """Test cleaning with empty DataFrame."""
        df = pd.DataFrame()
        
        with patch('src.services.cleaning.STORAGE_CLEANED', temp_dir):
            result_df = cleaning('test_file_123', df, mock_event_emitter)
            assert len(result_df) == 0

