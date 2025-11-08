"""Unit tests for calling_llm service."""
import pytest
import pandas as pd
import json
from unittest.mock import Mock, patch, MagicMock

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))

from src.services.calling_llm import _get_ai_model, _call_llm_api, calling_llm
from src.configs.constants import (
    TASK_STATUS_SENDING_TO_LLM,
    TASK_STATUS_SENDING_TO_LLM_PROGRESS,
    TASK_STATUS_SENDING_TO_LLM_DONE,
)


class TestGetAiModel:
    """Test cases for _get_ai_model function."""
    
    def test_get_ai_model_automatic_mode_prefers_external(self):
        """Test automatic mode prefers external models."""
        ai_config = {
            'preferences': {'mode': 'automatic', 'default_external_model_id': 'model1'},
            'external': [
                {'uid': 'model1', 'data': {'model': 'test-model'}},
                {'uid': 'model2', 'data': {'model': 'test-model-2'}}
            ],
            'local': [
                {'uid': 'local1', 'data': {'model': 'local-model'}}
            ]
        }
        
        model = _get_ai_model(ai_config, [])
        assert model is not None
        assert model['uid'] == 'model1'
    
    def test_get_ai_model_automatic_fallback_to_local(self):
        """Test automatic mode falls back to local if external unavailable."""
        ai_config = {
            'preferences': {'mode': 'automatic'},
            'external': [],
            'local': [
                {'uid': 'local1', 'data': {'model': 'local-model'}}
            ]
        }
        
        model = _get_ai_model(ai_config, [])
        assert model is not None
        assert model['uid'] == 'local1'
    
    def test_get_ai_model_external_mode(self):
        """Test external mode only uses external models."""
        ai_config = {
            'preferences': {'mode': 'external', 'default_external_model_id': 'model1'},
            'external': [
                {'uid': 'model1', 'data': {'model': 'test-model'}}
            ],
            'local': [
                {'uid': 'local1', 'data': {'model': 'local-model'}}
            ]
        }
        
        model = _get_ai_model(ai_config, [])
        assert model is not None
        assert model['uid'] == 'model1'
    
    def test_get_ai_model_local_mode(self):
        """Test local mode only uses local models."""
        ai_config = {
            'preferences': {'mode': 'local', 'default_local_model_id': 'local1'},
            'external': [
                {'uid': 'model1', 'data': {'model': 'test-model'}}
            ],
            'local': [
                {'uid': 'local1', 'data': {'model': 'local-model'}}
            ]
        }
        
        model = _get_ai_model(ai_config, [])
        assert model is not None
        assert model['uid'] == 'local1'
    
    def test_get_ai_model_excludes_tried_models(self):
        """Test that tried models are excluded."""
        ai_config = {
            'preferences': {'mode': 'automatic'},
            'external': [
                {'uid': 'model1', 'data': {'model': 'test-model'}},
                {'uid': 'model2', 'data': {'model': 'test-model-2'}}
            ],
            'local': []
        }
        
        model = _get_ai_model(ai_config, ['model1'])
        assert model is not None
        assert model['uid'] == 'model2'
    
    def test_get_ai_model_returns_none_when_no_models(self):
        """Test that function returns None when no models available."""
        ai_config = {
            'preferences': {'mode': 'automatic'},
            'external': [],
            'local': []
        }
        
        model = _get_ai_model(ai_config, [])
        assert model is None


class TestCallLlmApi:
    """Test cases for _call_llm_api function."""
    
    @pytest.fixture
    def sample_model(self):
        """Create sample model configuration."""
        return {
            'uid': 'test-model',
            'data': {
                'baseUrl': 'http://localhost:11434',
                'model': 'llama3',
                'apiKey': '',
                'retryRequests': 3
            }
        }
    
    @patch('src.services.calling_llm.Client')
    def test_call_llm_api_success(self, mock_client_class, sample_model):
        """Test successful LLM API call."""
        # Mock response
        mock_response = MagicMock()
        mock_response.response = json.dumps({
            'data': {
                'sentiment': ['positive', 'negative'],
                'priority': ['high', 'low'],
                'topic': ['topic1', 'topic2']
            }
        })
        
        mock_client = MagicMock()
        mock_client.generate.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        texts = ['Text 1', 'Text 2']
        result = _call_llm_api(sample_model, texts)
        
        assert 'data' in result
        assert 'sentiment' in result['data']
        assert len(result['data']['sentiment']) == 2
        mock_client.generate.assert_called_once()
    
    @patch('src.services.calling_llm.Client')
    def test_call_llm_api_with_custom_base_url(self, mock_client_class, sample_model):
        """Test LLM API call with custom base URL."""
        sample_model['data']['baseUrl'] = 'http://custom-host:11434'
        
        mock_response = MagicMock()
        mock_response.response = json.dumps({'data': {'sentiment': ['positive']}})
        
        mock_client = MagicMock()
        mock_client.generate.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        texts = ['Text 1']
        _call_llm_api(sample_model, texts)
        
        # Check that client was created with custom host
        mock_client_class.assert_called_once()
        call_kwargs = mock_client_class.call_args[1]
        assert 'host' in call_kwargs
        assert call_kwargs['host'] == 'http://custom-host:11434'
    
    @patch('src.services.calling_llm.Client')
    def test_call_llm_api_with_api_key(self, mock_client_class, sample_model):
        """Test LLM API call with API key."""
        sample_model['data']['apiKey'] = 'test-api-key'
        
        mock_response = MagicMock()
        mock_response.response = json.dumps({'data': {'sentiment': ['positive']}})
        
        mock_client = MagicMock()
        mock_client.generate.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        texts = ['Text 1']
        _call_llm_api(sample_model, texts)
        
        # Check that headers include Authorization
        mock_client_class.assert_called_once()
        call_kwargs = mock_client_class.call_args[1]
        assert 'headers' in call_kwargs
        assert 'Authorization' in call_kwargs['headers']
        assert 'Bearer test-api-key' in call_kwargs['headers']['Authorization']
    
    @patch('src.services.calling_llm.Client')
    def test_call_llm_api_handles_dict_response(self, mock_client_class, sample_model):
        """Test LLM API call with dict response."""
        mock_response = {
            'data': {
                'sentiment': ['positive'],
                'priority': ['high'],
                'topic': ['topic1']
            }
        }
        
        mock_client = MagicMock()
        mock_client.generate.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        texts = ['Text 1']
        result = _call_llm_api(sample_model, texts)
        
        assert 'data' in result
        assert result == mock_response
    
    @patch('src.services.calling_llm.Client')
    def test_call_llm_api_retries_on_failure(self, mock_client_class, sample_model):
        """Test LLM API call retries on failure."""
        from src.services.calling_llm import ResponseError
        
        mock_client = MagicMock()
        # First call fails, second succeeds
        mock_client.generate.side_effect = [
            ResponseError('Connection error'),
            MagicMock(response=json.dumps({'data': {'sentiment': ['positive']}}))
        ]
        mock_client_class.return_value = mock_client
        
        texts = ['Text 1']
        result = _call_llm_api(sample_model, texts, retry_count=0)
        
        # Should have retried
        assert mock_client.generate.call_count == 2
        assert 'data' in result


class TestCallingLlm:
    """Test cases for calling_llm function."""
    
    @pytest.fixture
    def sample_dataframe(self):
        """Create sample DataFrame for testing."""
        return pd.DataFrame({
            'id': [1, 2],
            'full_text': ['Great service!', 'Terrible experience']
        })
    
    @pytest.fixture
    def sample_ai_config(self):
        """Create sample AI configuration."""
        return {
            'preferences': {'mode': 'local', 'default_local_model_id': 'local1'},
            'local': [
                {
                    'uid': 'local1',
                    'data': {
                        'baseUrl': 'http://localhost:11434',
                        'model': 'llama3',
                        'apiKey': '',
                        'retryRequests': 3,
                        'paginateRowsLimit': 10
                    }
                }
            ]
        }
    
    @pytest.fixture
    def mock_event_emitter(self):
        """Create mock event emitter."""
        return Mock()
    
    @patch('src.services.calling_llm._call_llm_api')
    @patch('src.services.calling_llm._get_ai_model')
    def test_calling_llm_success(self, mock_get_model, mock_call_api, 
                                  sample_dataframe, sample_ai_config, mock_event_emitter):
        """Test successful LLM calling."""
        # Mock model selection
        mock_get_model.return_value = {
            'uid': 'local1',
            'data': {'model': 'llama3', 'baseUrl': 'http://localhost:11434'}
        }
        
        # Mock LLM response
        mock_call_api.return_value = {
            'data': {
                'sentiment': ['positive', 'negative'],
                'priority': ['high', 'low'],
                'topic': ['service', 'complaint']
            }
        }
        
        result_df, model_uid = calling_llm(
            'test_file_123',
            sample_dataframe,
            sample_ai_config,
            mock_event_emitter
        )
        
        # Check that new columns were added
        assert 'sentiment' in result_df.columns
        assert 'priority' in result_df.columns
        assert 'topic' in result_df.columns
        
        # Check values
        assert result_df['sentiment'].iloc[0] == 'positive'
        assert result_df['sentiment'].iloc[1] == 'negative'
        
        # Check events were emitted
        assert mock_event_emitter.called
        assert model_uid == 'local1'
    
    @patch('src.services.calling_llm._call_llm_api')
    @patch('src.services.calling_llm._get_ai_model')
    def test_calling_llm_emits_progress_events(self, mock_get_model, mock_call_api,
                                                sample_dataframe, sample_ai_config, mock_event_emitter):
        """Test that calling_llm emits progress events."""
        mock_get_model.return_value = {
            'uid': 'local1',
            'data': {'model': 'llama3', 'baseUrl': 'http://localhost:11434', 'paginateRowsLimit': 1}
        }
        
        mock_call_api.return_value = {
            'data': {
                'sentiment': ['positive'],
                'priority': ['high'],
                'topic': ['service']
            }
        }
        
        calling_llm('test_file_123', sample_dataframe, sample_ai_config, mock_event_emitter)
        
        # Check that progress events were emitted
        calls = [call[0] for call in mock_event_emitter.call_args_list]
        assert ('test_file_123', TASK_STATUS_SENDING_TO_LLM) in calls
        assert any(call[0] == 'test_file_123' and call[1] == TASK_STATUS_SENDING_TO_LLM_PROGRESS 
                  for call in mock_event_emitter.call_args_list)
        assert any(call[0] == 'test_file_123' and call[1] == TASK_STATUS_SENDING_TO_LLM_DONE 
                  for call in mock_event_emitter.call_args_list)
    
    @patch('src.services.calling_llm._get_ai_model')
    def test_calling_llm_no_model_available(self, mock_get_model,
                                            sample_dataframe, sample_ai_config, mock_event_emitter):
        """Test calling_llm when no model is available."""
        mock_get_model.return_value = None
        
        with pytest.raises(Exception) as exc_info:
            calling_llm('test_file_123', sample_dataframe, sample_ai_config, mock_event_emitter)
        
        assert 'No AI model available' in str(exc_info.value)

