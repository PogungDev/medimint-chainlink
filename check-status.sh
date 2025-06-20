#!/bin/bash

# MediMint Status Check Script
echo "🏥 MediMint Application Status Check"
echo "===================================="

# Check if server is running on port 8947
echo "🌐 Server Status:"
if lsof -i :8947 > /dev/null 2>&1; then
    echo "✅ Server is running on port 8947"
    echo "🔗 URL: http://localhost:8947"
    echo "🔗 Alternative: http://127.0.0.1:8947"
    
    # Show process details
    echo ""
    echo "📊 Process Details:"
    lsof -i :8947 | head -n 10
else
    echo "❌ Server is not running on port 8947"
    echo "💡 To start the server: npm run dev or ./start-dev.sh"
fi

echo ""
echo "📁 Project Directory: $(pwd)"
echo "📦 Node Version: $(node --version 2>/dev/null || echo 'Node not found')"
echo "📦 NPM Version: $(npm --version 2>/dev/null || echo 'NPM not found')"

# Check if .env.local exists
echo ""
echo "⚙️  Configuration:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "❌ .env.local missing"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed - run: npm install"
fi

echo ""
echo "🚀 Quick Commands:"
echo "  ./start-dev.sh    - Start development server"
echo "  ./setup-dev.sh    - Setup/reinstall dependencies"
echo "  npm run dev       - Start development server"
echo "  npm run build     - Build for production" 