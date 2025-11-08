# Multi-stage build for Dallosh Analysis - Auto Processing Datasets Microservice
# Using uv for faster Python package management
# See https://docs.astral.sh/uv/guides/integration/docker/

# Use uv Python image with build tools (for packages that need compilation)
FROM ghcr.io/astral-sh/uv:python3.10-bookworm AS base
WORKDIR /project/microservices/auto_processing_datasets

# Set system Python as default
ENV UV_SYSTEM_PYTHON=1

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies using uv with cache mount
# The bookworm image includes build tools (gcc, g++) needed for some packages
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system --no-cache -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs
