.PHONY: help worker listener install clean stop-worker

# Default target
help:
	@echo "Dallosh Analysis - Auto Processing Datasets Microservice"
	@echo "========================================================"
	@echo ""
	@echo "Available targets:"
	@echo "  make worker      - Start Celery worker (run in one terminal)"
	@echo "  make listener    - Start event listener (run in another terminal)"
	@echo "  make stop-worker  - Stop running Celery workers"
	@echo "  make install     - Install Python dependencies"
	@echo "  make clean       - Clean Python cache files"
	@echo ""
	@echo "Usage:"
	@echo "  Terminal 1: make worker"
	@echo "  Terminal 2: make listener"

# Create virtual environment
create-venv:
	@echo "Creating virtual environment..."
	@python -m venv venv
	@echo "Virtual environment created successfully!"

# Activate venv and start Celery worker
worker:
	@echo "Stopping any existing Celery workers..."
	@if [ -f "venv/Scripts/celery.exe" ]; then \
		venv/Scripts/celery.exe -A src.celery_app:celery_app control shutdown 2>/dev/null || true; \
	else \
		venv/Scripts/python.exe -m celery -A src.celery_app:celery_app control shutdown 2>/dev/null || true; \
	fi
	@sleep 2 || timeout /t 2 /nobreak >nul 2>&1 || true
	@echo "Starting Celery worker..."
	@if [ ! -d "venv" ]; then \
		echo "Error: venv directory not found. Please create a virtual environment first."; \
		exit 1; \
	fi
	@if [ -f "venv/Scripts/celery.exe" ]; then \
		venv/Scripts/celery.exe -A src.celery_app:celery_app worker --loglevel=info --queues=celery_processing_queue --pool=solo --concurrency=1; \
	else \
		venv/Scripts/python.exe -m celery -A src.celery_app:celery_app worker --loglevel=info --queues=celery_processing_queue --pool=solo --concurrency=1; \
	fi

# Activate venv and start event listener
listener:
	@echo "Starting event listener..."
	@if [ ! -d "venv" ]; then \
		echo "Error: venv directory not found. Please create a virtual environment first."; \
		exit 1; \
	fi
	@venv/Scripts/python.exe main.py

# Install dependencies
install:
	@echo "Installing dependencies..."
	@if [ ! -d "venv" ]; then \
		echo "Error: venv directory not found. Please create a virtual environment first."; \
		echo "Create one with: python -m venv venv"; \
		exit 1; \
	fi
	@venv/Scripts/pip.exe install -r requirements.txt

# Stop Celery workers
stop-worker:
	@echo "Stopping Celery workers..."
	@if [ ! -d "venv" ]; then \
		echo "Error: venv directory not found."; \
		exit 1; \
	fi
	@if [ -f "venv/Scripts/celery.exe" ]; then \
		venv/Scripts/celery.exe -A src.celery_app:celery_app control shutdown 2>/dev/null || echo "No workers to stop"; \
	else \
		venv/Scripts/python.exe -m celery -A src.celery_app:celery_app control shutdown 2>/dev/null || echo "No workers to stop"; \
	fi

# Clean Python cache
clean:
	@echo "Cleaning Python cache files..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name "*.pyo" -delete 2>/dev/null || true
	@echo "Cache cleaned!"

