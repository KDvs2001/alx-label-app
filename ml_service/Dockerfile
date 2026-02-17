# Dockerfile for CAL-Log ML Service
# Optimised for Hugging Face Spaces

FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements FIRST to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# Increase timeout for large downloads (torch, etc.)
RUN pip install --no-cache-dir -r requirements.txt --timeout 1000

# Copy the entire ml_service directory contents to /app
# This includes simulation_server.py, utilities/, cost_engine.py, models/
COPY . /app

# Expose the port (7860 is standard for HF Spaces)
EXPOSE 7860

# Run the application
# Use gunicorn for production stability if available, else python
# Command adapts to PORT env var
CMD ["python", "simulation_server.py"]
