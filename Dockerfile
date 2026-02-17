# Dockerfile for CAL-Log ML Service
# Optimised for Hugging Face Spaces (placed at repo root)

FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements FIRST to leverage Docker cache
COPY ml_service/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt --timeout 1000

# Copy the ML service code to /app
COPY ml_service/ /app/

# Expose the port (7860 is standard for HF Spaces)
EXPOSE 7860

# Run the application
CMD ["python", "simulation_server.py"]
