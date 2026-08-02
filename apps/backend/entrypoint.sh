#!/bin/bash
set -e

# Run migrations
python manage.py migrate

# Seed basic data if not exists (we can safely run this)
python seed_users.py || true
python seed_analytics_data.py || true

# Check if we are running ASGI or WSGI
if [ "$1" = "api" ]; then
    echo "Starting HTTP API Server (Gunicorn)..."
    exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4 --threads 4
elif [ "$1" = "ws" ]; then
    echo "Starting WebSocket Server (Daphne)..."
    exec daphne -b 0.0.0.0 -p 8001 core.asgi:application
else
    # Default to development server
    echo "Starting Development Server..."
    exec python manage.py runserver 0.0.0.0:8000
fi
