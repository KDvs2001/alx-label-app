# Base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy local requirements and install
# Note: We assume requirements.txt exists or we create a minimal one
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install label-studio-ml

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 9090

# Command to run the ML backend
CMD ["label-studio-ml", "start", "my_backend", "--port", "9090"]
