"""Pytest configuration and shared fixtures."""
import pytest
import os
import sys

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../'))

