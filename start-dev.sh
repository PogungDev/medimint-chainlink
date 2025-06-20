#!/bin/bash

# MediMint Development Startup Script
echo "🏥 Starting MediMint Development Environment..."
echo "Port: 8947 (unusual port as requested)"

# Navigate to project directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found! Please create it based on .env.example"
    exit 1
fi

# Start the development server
echo "🚀 Starting development server on port 8947..."
echo "🌐 Open http://localhost:8947 in your browser"
echo "📱 Or http://127.0.0.1:8947"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev 