# Unit Tests for Dallosh Analysis Microservice

This directory contains unit tests for the microservice components.

## Structure

```
test/
├── units/              # Unit tests for individual services
│   ├── test_cleaning.py
│   ├── test_reading_file.py
│   ├── test_calling_llm.py
│   ├── test_appending_columns.py
│   ├── test_saving.py
│   ├── test_helpers.py
│   └── test_retry_step.py
├── e2e/               # End-to-end tests (to be implemented)
└── conftest.py        # Pytest configuration and shared fixtures
```

## Running Tests

### Run all unit tests:
```bash
pytest test/units/
```

### Run a specific test file:
```bash
pytest test/units/test_cleaning.py
```

### Run with coverage:
```bash
pytest test/units/ --cov=src --cov-report=html
```

### Run with verbose output:
```bash
pytest test/units/ -v
```

### Run a specific test:
```bash
pytest test/units/test_cleaning.py::TestRemoveEmoji::test_remove_emoji_basic
```

## Test Coverage

The unit tests cover:

1. **Cleaning Service** (`test_cleaning.py`):
   - Emoji removal
   - @ mention preservation
   - Duplicate removal
   - Outlier detection
   - File saving
   - Database updates

2. **Reading File Service** (`test_reading_file.py`):
   - CSV file reading
   - File ID extraction
   - Event emission
   - Error handling

3. **LLM Calling Service** (`test_calling_llm.py`):
   - Model selection (automatic, external, local modes)
   - API calls with retry logic
   - Response parsing
   - Error handling

4. **Appending Columns Service** (`test_appending_columns.py`):
   - Event emission

5. **Saving Service** (`test_saving.py`):
   - File saving
   - Database updates
   - Event emission

6. **Helper Functions** (`test_helpers.py`):
   - Directory creation
   - File ID extraction

7. **Retry Step Service** (`test_retry_step.py`):
   - Step resumption logic
   - Conditional step execution

## Writing New Tests

When adding new tests:

1. Follow the naming convention: `test_<module_name>.py`
2. Use descriptive test class names: `Test<FunctionName>`
3. Use descriptive test method names: `test_<what_it_tests>`
4. Use fixtures for common setup (see `conftest.py`)
5. Mock external dependencies (database, file system, API calls)
6. Test both success and error cases

## Example Test Structure

```python
"""Unit tests for <service_name>."""
import pytest
from unittest.mock import Mock, patch

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))

from src.services.<service_name> import <function_name>


class TestFunctionName:
    """Test cases for <function_name> function."""
    
    @pytest.fixture
    def mock_dependency(self):
        """Create mock dependency."""
        return Mock()
    
    def test_function_success(self, mock_dependency):
        """Test successful function execution."""
        result = <function_name>(mock_dependency)
        assert result is not None
```

## Dependencies

Tests require:
- `pytest>=7.4.0`
- `pytest-cov>=4.1.0` (for coverage reports)

Install test dependencies:
```bash
pip install -r requirements.txt
```

