"""Unit tests for appending_columns service."""
import pytest
from unittest.mock import Mock

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))

from src.services.appending_columns import appending_columns
from src.configs.constants import (
    TASK_STATUS_APPENDING_COLUMNS,
    TASK_STATUS_APPENDING_COLUMNS_DONE,
)


class TestAppendingColumns:
    """Test cases for appending_columns function."""
    
    @pytest.fixture
    def mock_event_emitter(self):
        """Create mock event emitter."""
        return Mock()
    
    def test_appending_columns_emits_events(self, mock_event_emitter):
        """Test that appending_columns emits correct events."""
        appending_columns('test_file_123', mock_event_emitter)
        
        # Check that events were emitted
        assert mock_event_emitter.called
        assert mock_event_emitter.call_count == 2
        
        # Check event types
        calls = [call[0] for call in mock_event_emitter.call_args_list]
        assert ('test_file_123', TASK_STATUS_APPENDING_COLUMNS) in calls
        assert ('test_file_123', TASK_STATUS_APPENDING_COLUMNS_DONE) in calls
    
    def test_appending_columns_correct_file_id(self, mock_event_emitter):
        """Test that appending_columns uses correct file_id."""
        file_id = 'test_file_456'
        appending_columns(file_id, mock_event_emitter)
        
        # Check that all calls use the correct file_id
        for call in mock_event_emitter.call_args_list:
            assert call[0][0] == file_id

