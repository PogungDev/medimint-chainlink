#!/bin/bash

# MediMint Development Setup Script
echo "🏥 Setting up MediMint Development Environment..."

# Navigate to project directory
cd "$(dirname "$0")"

# Create necessary directories if they don't exist
echo "📁 Creating project directories..."
mkdir -p logs
mkdir -p temp
mkdir -p uploads

# Install dependencies
echo "📦 Installing all dependencies..."
npm install

# Check if hardhat network is configured
echo "⚙️  Checking Hardhat configuration..."
if [ -f "hardhat.config.js" ]; then
    echo "✅ Hardhat configuration found"
else
    echo "⚠️  Hardhat configuration not found"
fi

# Compile smart contracts
echo "🔧 Compiling smart contracts..."
npm run compile

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 .env.local already created with development configuration"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development server:"
echo "  ./start-dev.sh"
echo "  or"
echo "  npm run dev"
echo ""
echo "The application will run on port 8947"
echo "🌐 http://localhost:8947" 