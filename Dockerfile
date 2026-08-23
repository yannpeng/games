# Production Dockerfile for Cyberpunk Arcade Platform
FROM python:3.11-slim

# Set container environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ARCADE_DB_PATH=/app/data/arcade_games.db \
    PORT=8000

# Set container working directory
WORKDIR /app

# Install curl for container health check
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create application data directory (ownership will be set after user creation)
RUN mkdir -p /app/data

# Copy application assets and backend code
COPY app/ app/
COPY hub/ hub/
COPY tetris/ tetris/
COPY snake/ snake/
COPY defense/ defense/
COPY pyproject.toml .
COPY entrypoint.sh .

# Ensure executable permissions on Linux entrypoint
RUN chmod +x /app/entrypoint.sh

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app/data
USER appuser

# Expose HTTP port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/api/games || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]

# Start ASGI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
