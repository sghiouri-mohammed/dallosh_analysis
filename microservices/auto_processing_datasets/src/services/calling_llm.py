"""Callback function for calling LLM API."""
import json
import time
from typing import Dict, List, Optional
import sys
import os
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

try:
    from ollama import Client, ResponseError
except ImportError:
    # Fallback if ollama is not installed
    Client = None
    ResponseError = Exception

from src.configs.constants import (
    TASK_STATUS_SENDING_TO_LLM,
    TASK_STATUS_SENDING_TO_LLM_PROGRESS,
    TASK_STATUS_SENDING_TO_LLM_DONE,
)
from src.configs.env import (
    DEFAULT_PAGINATE_ROWS_LIMIT, DEFAULT_RETRY_REQUESTS,
    MAX_PAGINATE_ROWS_LIMIT, MAX_RETRY_REQUESTS
)


def _get_ai_model(ai_config: dict, tried_models: List[str] = None) -> Optional[dict]:
    """
    Get the appropriate AI model based on configuration with fallback logic.
    
    Args:
        ai_config: AI configuration dictionary
        tried_models: List of model UIDs that have already been tried
    
    Returns:
        Model dictionary or None
    """
    if tried_models is None:
        tried_models = []
    
    preferences = ai_config.get('preferences', {})
    mode = preferences.get('mode', 'local')
    
    if mode == 'automatic':
        # Try external first
        default_external_id = preferences.get('default_external_model_id')
        external_models = ai_config.get('external', [])
        
        if default_external_id and external_models:
            for model in external_models:
                if model.get('uid') == default_external_id and model.get('uid') not in tried_models:
                    return model
        
        # Fallback to other external models
        for model in external_models:
            if model.get('uid') not in tried_models:
                return model
        
        # Fallback to local models
        local_models = ai_config.get('local', [])
        for model in local_models:
            if model.get('uid') not in tried_models:
                return model
    
    elif mode == 'external':
        external_models = ai_config.get('external', [])
        default_external_id = preferences.get('default_external_model_id')
        
        if default_external_id and external_models:
            for model in external_models:
                if model.get('uid') == default_external_id and model.get('uid') not in tried_models:
                    return model
        
        for model in external_models:
            if model.get('uid') not in tried_models:
                return model
    
    elif mode == 'local':
        local_models = ai_config.get('local', [])
        default_local_id = preferences.get('default_local_model_id')
        
        if default_local_id and local_models:
            for model in local_models:
                if model.get('uid') == default_local_id and model.get('uid') not in tried_models:
                    return model
        
        for model in local_models:
            if model.get('uid') not in tried_models:
                return model
    
    return None


def _call_llm_api(model: dict, texts: List[str], retry_count: int = 0) -> dict:
    """
    Call LLM API with retry logic using the official Ollama Python library.
    
    Args:
        model: Model configuration dictionary
        texts: List of texts to analyze
        retry_count: Current retry attempt
    
    Returns:
        Dictionary with analysis, priority, and topics arrays
    """
    if Client is None:
        raise ImportError("Ollama Python library is not installed. Run: pip install ollama")
    
    base_url = model['data']['baseUrl']
    api_key = model['data'].get('apiKey', '')
    model_name = model['data']['model']
    max_retries = min(model['data'].get('retryRequests', DEFAULT_RETRY_REQUESTS), MAX_RETRY_REQUESTS)
    
    # Prepare prompt
    prompt = f"""You are analyzing customer complaints/messages from social media posts from Twitter, where the user mentioned brand name or company name in telecommunication industry about the customer service, the company is Free Mobile located in France. For each post below, provide:
- sentiment: 'negative', 'neutral', or 'positive'
- priority: 'high', 'normal', or 'low'
- topic: main topic/subject of the post


Analyze the following posts and return a JSON object with:
- data: object containing sentiment, priority, and topic arrays

I have a list of posts contaiing {len(texts)} posts.
List of Posts:
{json.dumps(texts, ensure_ascii=False)}

I want for each post in the list of posts, you will return the sentiment, priority, and topic for that post.

Return only valid JSON in this exact format:
{{"data": {{"sentiment": [...], "priority": [...], "topic": [...]}}}}

Where:
- sentiment array which contains: 'negative', 'neutral', or 'positive' for each post
- priority array contains: 'high', 'normal', or 'low' for each post
- topic array contains: the main topic/subject for each post"""
    
    # Create Ollama client with custom host if needed
    client_kwargs = {}
    if base_url and base_url != 'http://localhost:11434':
        client_kwargs['host'] = base_url
    
    # Add headers if API key is provided
    headers = {}
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    if headers:
        client_kwargs['headers'] = headers
    
    try:
        client = Client(**client_kwargs) if client_kwargs else Client()
        
        # Use generate for text completion with JSON format
        response = client.generate(
            model=model_name,
            prompt=prompt,
            format="json",  # Force JSON output format
            stream=False
        )
        
        # Extract response - when format="json" is used, Ollama may return parsed JSON or JSON string
        # Ollama library returns response that can be accessed as dict or object
        response_data = None
        if hasattr(response, 'response'):
            response_data = response.response
        elif isinstance(response, dict):
            response_data = response.get('response', response)
        elif isinstance(response, str):
            response_data = response
        else:
            # Try to convert to string or get attribute
            try:
                response_data = str(response)
            except:
                response_data = getattr(response, 'response', None)
        
        if not response_data:
            raise ValueError("Empty response from LLM")
        
        # Parse JSON from response (handle dict, list, and string formats)
        if isinstance(response_data, dict):
            # Already parsed JSON dict
            return response_data
        elif isinstance(response_data, list):
            # Already parsed JSON list - wrap it for consistency
            print(f"Warning: LLM returned list directly: {type(response_data)}, length: {len(response_data)}")
            return {'data': response_data} if response_data else {}
        elif isinstance(response_data, str):
            # JSON string, parse it
            try:
                parsed = json.loads(response_data.strip())
                # If parsed result is a list, wrap it
                if isinstance(parsed, list):
                    print(f"Warning: Parsed JSON is a list: length {len(parsed)}")
                    return {'data': parsed} if parsed else {}
                return parsed
            except json.JSONDecodeError as e:
                # Try to extract JSON from text if wrapped
                import re
                json_match = re.search(r'\{.*\}', response_data, re.DOTALL)
                if json_match:
                    try:
                        parsed = json.loads(json_match.group())
                        if isinstance(parsed, list):
                            return {'data': parsed} if parsed else {}
                        return parsed
                    except json.JSONDecodeError:
                        pass
                # Log the actual response for debugging
                print(f"JSON decode error: {e}")
                print(f"Response data (first 500 chars): {response_data[:500]}")
                raise ValueError(f"Invalid JSON response from LLM: {str(e)}")
        else:
            # Unexpected type
            raise ValueError(f"Unexpected response type: {type(response_data)}, value: {str(response_data)[:200]}")
    
    except ResponseError as e:
        if retry_count < max_retries:
            print(f"LLM API call failed (attempt {retry_count + 1}/{max_retries}): {e}")
            time.sleep(2 ** retry_count)  # Exponential backoff
            return _call_llm_api(model, texts, retry_count + 1)
        else:
            raise Exception(f"LLM API call failed after {max_retries} retries: {e}")
    except Exception as e:
        if retry_count < max_retries:
            print(f"LLM API call failed (attempt {retry_count + 1}/{max_retries}): {e}")
            time.sleep(2 ** retry_count)  # Exponential backoff
            return _call_llm_api(model, texts, retry_count + 1)
        else:
            raise Exception(f"LLM API call failed after {max_retries} retries: {e}")


def calling_llm(file_id: str, df, ai_config: dict, event_emitter: callable, 
                tried_models: List[str] = None) -> tuple[pd.DataFrame, str]:
    """
    Process dataset with LLM to add sentiment, priority, and topics.
    
    Args:
        file_id: File identifier
        df: DataFrame with 'full_text' column
        ai_config: AI configuration dictionary
        event_emitter: Function to emit events (file_id, event)
        tried_models: List of model UIDs that have already been tried
    
    Returns:
        Tuple of (DataFrame with new columns, model_uid used)
    """
    import pandas as pd
    
    if tried_models is None:
        tried_models = []
    
    if 'full_text' not in df.columns:
        raise ValueError("Dataset must have 'full_text' column")
    
    # Emit LLM processing event
    event_emitter(file_id, TASK_STATUS_SENDING_TO_LLM)
    
    # Get AI model with fallback
    model = _get_ai_model(ai_config, tried_models)
    if not model:
        raise ValueError("No AI model available")
    
    model_uid = model.get('uid')
    paginate_limit = min(
        model['data'].get('paginateRowsLimit', DEFAULT_PAGINATE_ROWS_LIMIT),
        MAX_PAGINATE_ROWS_LIMIT
    )
    
    # Initialize new columns
    sentiments = []
    priorities = []
    topics = []
    
    # Process in batches
    total_rows = len(df)
    num_batches = (total_rows + paginate_limit - 1) // paginate_limit
    
    print(f"Processing {total_rows} rows in {num_batches} batches of {paginate_limit}")
    last_success_model = None

    for i in range(0, total_rows, paginate_limit):
        batch = df.iloc[i:i + paginate_limit]
        texts = batch['full_text'].tolist()
        
        print(f"Processing batch {i // paginate_limit + 1}/{num_batches} ({len(texts)} rows)")
        
        try:
            result = _call_llm_api(model, texts)
            
            # Log the result structure for debugging (first time only)
            if i == 0:
                print(f"Debug: LLM result type: {type(result)}, keys: {result.keys() if isinstance(result, dict) else 'N/A'}")
            
            # Extract results - handle multiple response formats
            # Result can be: {data: {sentiment: [], priority: [], topic: []}} or {sentiment: [], priority: [], topic: []}
            # Or sometimes just a list
            if isinstance(result, list):
                # If result is a list, it's unexpected - log and use defaults
                print(f"Warning: LLM returned list instead of dict: {result[:3] if len(result) > 3 else result}")
                batch_sentiments = []
                batch_priorities = []
                batch_topics = []
            elif isinstance(result, dict):
                # Handle dict format
                data = result.get('data', result)  # Support both {data: {...}} and {...} formats
                if isinstance(data, dict):
                    batch_sentiments = data.get('sentiment', data.get('analysis', []))
                    batch_priorities = data.get('priority', [])
                    batch_topics = data.get('topic', data.get('topics', []))
                    # Log if we got empty results
                    if not batch_sentiments and not batch_priorities and not batch_topics:
                        print(f"Warning: Empty results from LLM. Result keys: {result.keys()}, Data keys: {data.keys() if isinstance(data, dict) else 'N/A'}")
                elif isinstance(data, list):
                    # If data is a list, attempt to aggregate per-row objects
                    print(f"Info: LLM returned list in data field: {data[:2] if len(data) > 2 else data}")
                    aggregated_sentiments = []
                    aggregated_priorities = []
                    aggregated_topics = []

                    for item in data:
                        if isinstance(item, dict):
                            sentiment_value = item.get('sentiment')
                            priority_value = item.get('priority')
                            topic_value = item.get('topic') or item.get('topics')

                            if isinstance(sentiment_value, list):
                                aggregated_sentiments.extend(sentiment_value)
                            elif sentiment_value is not None:
                                aggregated_sentiments.append(sentiment_value)

                            if isinstance(priority_value, list):
                                aggregated_priorities.extend(priority_value)
                            elif priority_value is not None:
                                aggregated_priorities.append(priority_value)

                            if isinstance(topic_value, list):
                                aggregated_topics.extend(topic_value)
                            elif topic_value is not None:
                                aggregated_topics.append(topic_value)
                        else:
                            # Attempt to coerce non-dict entries
                            if item is not None:
                                aggregated_sentiments.append(str(item))

                    batch_sentiments = aggregated_sentiments
                    batch_priorities = aggregated_priorities
                    batch_topics = aggregated_topics
                else:
                    print(f"Warning: Unexpected data type in result: {type(data)}")
                    batch_sentiments = []
                    batch_priorities = []
                    batch_topics = []
            else:
                # Unexpected type
                print(f"Warning: Unexpected result type: {type(result)}, value: {str(result)[:200]}")
                batch_sentiments = []
                batch_priorities = []
                batch_topics = []
            
            # Ensure we have lists
            if not isinstance(batch_sentiments, list):
                print(f"Warning: batch_sentiments is not a list: {type(batch_sentiments)}")
                batch_sentiments = []
            if not isinstance(batch_priorities, list):
                print(f"Warning: batch_priorities is not a list: {type(batch_priorities)}")
                batch_priorities = []
            if not isinstance(batch_topics, list):
                print(f"Warning: batch_topics is not a list: {type(batch_topics)}")
                batch_topics = []
            
            # If we have empty results, this is an error - raise exception to trigger fallback
            if not batch_sentiments and not batch_priorities and not batch_topics:
                raise ValueError(f"Empty results from LLM. Expected arrays but got empty lists. Result structure: {type(result)}")
            
            # Normalize priority values (high/normal/low to 2/1/0)
            normalized_priorities = []
            for p in batch_priorities:
                if isinstance(p, str):
                    if p.lower() in ['high', 'h']:
                        normalized_priorities.append(2)
                    elif p.lower() in ['normal', 'medium', 'm', 'n']:
                        normalized_priorities.append(1)
                    elif p.lower() in ['low', 'l']:
                        normalized_priorities.append(0)
                    else:
                        normalized_priorities.append(1)  # default to normal
                else:
                    normalized_priorities.append(int(p) if isinstance(p, (int, float)) else 1)
            
            batch_priorities = normalized_priorities
            
            # Ensure all arrays have the same length
            batch_size = len(texts)
            while len(batch_sentiments) < batch_size:
                batch_sentiments.append('neutral')
            while len(batch_priorities) < batch_size:
                batch_priorities.append(0)
            while len(batch_topics) < batch_size:
                batch_topics.append('general')
            
            sentiments.extend(batch_sentiments[:batch_size])
            priorities.extend(batch_priorities[:batch_size])
            topics.extend(batch_topics[:batch_size])
            last_success_model = model_uid

            event_emitter(
                file_id,
                TASK_STATUS_SENDING_TO_LLM_PROGRESS,
                {
                    'batch': (i // paginate_limit) + 1,
                    'total_batches': num_batches,
                    'batch_size': batch_size,
                    'model_uid': model_uid,
                }
            )
        
        except Exception as e:
            print(f"Error processing batch with model {model_uid}: {e}")
            # Try next model if available
            tried_models.append(model_uid)
            next_model = _get_ai_model(ai_config, tried_models)
            
            if next_model:
                print(f"Trying fallback model: {next_model.get('uid')}")
                model = next_model
                model_uid = model.get('uid')
                # Retry this batch with new model
                i -= paginate_limit  # Retry this batch
                continue
            else:
                # No more models, fill with defaults
                batch_size = len(texts)
                sentiments.extend(['neutral'] * batch_size)
                priorities.extend([0] * batch_size)
                topics.extend(['general'] * batch_size)
                fallback_model = model_uid or 'default'
                last_success_model = fallback_model
                event_emitter(
                    file_id,
                    TASK_STATUS_SENDING_TO_LLM_PROGRESS,
                    {
                        'batch': (i // paginate_limit) + 1,
                        'total_batches': num_batches,
                        'batch_size': batch_size,
                        'model_uid': fallback_model,
                        'fallback_used': True,
                    }
                )
    
    # Add columns to dataframe (use main_topic as column name)
    df['sentiment'] = sentiments[:total_rows]
    df['priority'] = priorities[:total_rows]
    df['main_topic'] = topics[:total_rows]  # Column name is main_topic
    
    print(f"Added columns: sentiment, priority, main_topic")
    
    event_emitter(
        file_id,
        TASK_STATUS_SENDING_TO_LLM_DONE,
        {
            'total_rows': total_rows,
            'total_batches': num_batches,
            'model_uid': last_success_model or model_uid,
        }
    )
    
    return df, model_uid

