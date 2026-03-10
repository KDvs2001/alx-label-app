# Dockerfile for CAL-Log ML Service
# Optimised for Hugging Face Spaces (placed at repo root)

FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
# clean up the apt lists afterwards so they don't bloat the final docker image layer
# CITATION: rm -rf /var/lib/apt/lists/* - remove apt cache to shrink image size
# SOURCE: Docker Docs (n.d.). "Dockerfile best practices"
# URL: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#run
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements FIRST to leverage Docker cache
# do this before copying the rest of the code so that if only python code changes, 
# docker doesn't trigger a full reinstall of all pip dependencies
# CITATION: COPY requirements.txt first - leverage Docker layer caching
# SOURCE: Stack Overflow (2015). "Best practise for Dockerfile layer caching"
# URL: https://stackoverflow.com/questions/34398188/best-practise-for-dockerfile-caching
COPY ml_service/requirements.txt .

# Install Python dependencies
# --no-cache-dir stops pip from saving the downloaded .whl files to disk,
# which we don't need in a container and just wastes space
# CITATION: pip install --no-cache-dir - disable pip caching for smaller containers
# SOURCE: Stack Overflow (2017). "What is pip's --no-cache-dir good for?"
# URL: https://stackoverflow.com/questions/45594707/what-is-pips-no-cache-dir-good-for
RUN pip install --no-cache-dir -r requirements.txt --timeout 1000

# Copy the ML service code to /app
COPY ml_service/ /app/

# Set the port for HF Spaces (simulation_server.py reads PORT env var)
ENV PORT=7860

# Expose the port (7860 is standard for HF Spaces)
EXPOSE 7860

# Run the application
CMD ["python", "simulation_server.py"]
