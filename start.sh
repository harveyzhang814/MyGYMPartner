#!/bin/bash

echo "🚀 Starting MyGYMPartner Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
echo "📦 Starting services with Docker Compose..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Start backend
echo "🔧 Starting backend..."
docker-compose up -d backend

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
docker-compose up -d frontend

echo "✅ All services started successfully!"
echo ""
echo "📊 Services:"
echo "  - Database: http://localhost:5432"
echo "  - Backend API: http://localhost:3001"
echo "  - Frontend: http://localhost:5173"
echo ""
echo "🔗 Health Check: http://localhost:3001/health"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
