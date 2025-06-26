#!/bin/bash

# MediMint A-Z Setup Script for Arbitrum Sepolia
echo "🏥 MediMint A-Z Setup - Arbitrum Sepolia Edition"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    cp .env.example .env.local
    print_status "Created .env.local from template"
    print_info "Please edit .env.local with your private key and API keys"
    echo ""
fi

# Step 1: Install dependencies
print_info "STEP 1: Installing Dependencies"
print_info "==============================="
npm install
print_status "Dependencies installed"
echo ""

# Step 2: Compile contracts
print_info "STEP 2: Compiling Smart Contracts"
print_info "=================================="
npm run compile
if [ $? -eq 0 ]; then
    print_status "Smart contracts compiled successfully"
else
    print_error "Contract compilation failed"
    exit 1
fi
echo ""

# Step 3: Deploy to Arbitrum Sepolia
print_info "STEP 3: Deploying to Arbitrum Sepolia"
print_info "======================================"
print_warning "Make sure you have:"
echo "- Private key in .env.local"
echo "- ETH for gas from https://faucets.chain.link"
echo "- Arbiscan API key (optional, for verification)"
echo ""

read -p "Continue with deployment? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run deploy
    if [ $? -eq 0 ]; then
        print_status "Deployment successful!"
    else
        print_error "Deployment failed"
        exit 1
    fi
else
    print_warning "Deployment skipped"
fi
echo ""

# Step 4: Show next steps
print_info "STEP 4: Next Steps"
print_info "=================="
echo ""
print_status "🎉 A-Z Setup Complete!"
echo ""
echo "📚 Manual Steps Required:"
echo "1. Create Chainlink Functions subscription at https://functions.chain.link"
echo "2. Update CHAINLINK_SUBSCRIPTION_ID in .env.local"
echo "3. Register Chainlink Automation upkeep at https://automation.chain.link"
echo "4. Get testnet USDC or deploy mock USDC"
echo ""
echo "🚀 Test the demo flow:"
echo "npm run demo:flow"
echo ""
echo "🌐 Start the frontend:"
echo "npm run dev"
echo ""
echo "📊 Monitor on Arbiscan:"
echo "https://sepolia.arbiscan.io"
echo ""
print_status "Setup complete! Ready for judging! 🏆" 