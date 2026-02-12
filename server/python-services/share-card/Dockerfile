FROM python:3.12-slim

# Install system dependencies for Cairo, Pango, and fonts
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libgdk-pixbuf-2.0-dev \
    pkg-config \
    fontconfig \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy application files
COPY requirements.txt .
COPY app.py .
COPY templates/ ./templates/
COPY download_fonts.sh .
COPY fonts/ ./fonts/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download and register fonts
RUN chmod +x download_fonts.sh && ./download_fonts.sh && fc-cache -f

# Expose Flask port
EXPOSE 5000

# Run with gunicorn (4 workers for parallel rendering)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
