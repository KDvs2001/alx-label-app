# Dockerfile for CAL-Log ML Service
# Optimised for Hugging Face Spaces (placed at repo root)

FROM python:3.9-slim

# Create user with UID 1000 (standard non-root user for Hugging Face Spaces)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install system dependencies (run as root, then switch back to user)
USER root
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

USER user

# Copy requirements FIRST to leverage Docker cache
# (On Hugging Face, files are at the root of the repository, not inside ml_service/)
COPY --chown=user requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt --timeout 1000

# Copy the ML service code to the app directory
COPY --chown=user . $HOME/app/

# Set the port for HF Spaces (simulation_server.py reads PORT env var)
ENV PORT=7860

# Expose the port (7860 is standard for HF Spaces)
EXPOSE 7860

# Run the application
CMD ["python", "simulation_server.py"]
