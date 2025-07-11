#!/bin/bash

# CircularChain Development Setup Script
echo "🔗 Setting up CircularChain development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm version: $(npm --version)"

# Install dependencies for all projects
print_status "Installing dependencies for all projects..."

# Backend dependencies
print_status "Installing backend dependencies..."
cd CircularChainBackend
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

# Frontend dependencies
print_status "Installing frontend dependencies..."
cd CircularChainFrontend/circularchain-frontend
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ../..

# Dashboard dependencies
print_status "Installing dashboard dependencies..."
cd CircularChainFrontend/circularchain-dashboard-v2
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dashboard dependencies"
    exit 1
fi
cd ../..

# Mobile dependencies
print_status "Installing mobile dependencies..."
cd circularchain-mobile
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install mobile dependencies"
    exit 1
fi

# Check for Expo CLI
if ! command -v expo &> /dev/null; then
    print_warning "Expo CLI is not installed globally. Installing..."
    npm install -g @expo/cli
fi

cd ..

# Compile smart contracts
print_status "Compiling smart contracts..."
cd CircularChainBackend
npx hardhat compile
if [ $? -ne 0 ]; then
    print_error "Failed to compile smart contracts"
    exit 1
fi
cd ..

# Check for environment files
print_status "Checking environment configuration..."
if [ ! -f "CircularChainBackend/.env" ]; then
    print_warning "Backend .env file not found. Creating template..."
    cat > CircularChainBackend/.env << EOF
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Network Configuration
NETWORK=localhost
PORT=3001

# Database Configuration (if needed)
DATABASE_URL=your_database_url_here
EOF
    print_warning "Please configure CircularChainBackend/.env with your actual values"
fi

# Success message
print_status "✅ Development environment setup complete!"
echo ""
echo "🚀 Quick Start Commands:"
echo "  Mobile App:     npm run dev:mobile"
echo "  Frontend:       npm run dev:frontend"
echo "  Dashboard:      npm run dev:dashboard"
echo "  Backend:        npm run dev:backend"
echo ""
echo "📚 For more information, see README.md"
echo ""
print_warning "Don't forget to configure your environment variables in CircularChainBackend/.env"
