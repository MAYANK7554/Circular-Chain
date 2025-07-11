# CircularChain - Blockchain Product Passport System

A comprehensive blockchain-based system for creating and tracking product passports to promote circular economy principles.

## 🏗️ Project Structure

```
CircularChain/
├── circularchain-mobile/          # React Native mobile app (Expo)
├── CircularChainFrontend/          # Frontend applications
│   ├── circularchain-frontend/     # Main web frontend
│   └── circularchain-dashboard-v2/ # Dashboard v2
├── CircularChainBackend/           # Hardhat blockchain backend
└── package.json                   # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI (for mobile development)
- MetaMask or other Web3 wallet

### Installation

1. Clone the repository and install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
# Copy and configure environment files
cp CircularChainBackend/.env.example CircularChainBackend/.env
```

### Development

Start all services:
```bash
# Mobile app
npm run dev:mobile

# Main frontend
npm run dev:frontend

# Dashboard v2
npm run dev:dashboard

# Backend server
npm run dev:backend
```

### Building

Build all projects:
```bash
npm run build:mobile
npm run build:frontend
npm run build:dashboard
```

## 📱 Mobile App (Expo/React Native)

Located in `circularchain-mobile/`

**Key Features:**
- QR code scanning for product verification
- Product passport viewing
- Cross-platform (iOS/Android)

**Tech Stack:**
- React Native with Expo
- Expo Router for navigation
- Axios for API calls
- Expo Camera for QR scanning

**Commands:**
```bash
cd circularchain-mobile
npm run start      # Start development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

## 🌐 Frontend Applications

### Main Frontend (`CircularChainFrontend/circularchain-frontend/`)

**Tech Stack:**
- React 18
- Vite
- Chakra UI
- Axios
- Firebase integration

**Features:**
- Product registration and minting
- Product passport viewing
- Google OAuth integration

### Dashboard v2 (`CircularChainFrontend/circularchain-dashboard-v2/`)

**Tech Stack:**
- React 19
- Vite
- Chakra UI 3.x
- Modern build tools

**Features:**
- Enhanced dashboard interface
- Modern UI components
- Improved performance

## ⛓️ Backend (Blockchain)

Located in `CircularChainBackend/`

**Tech Stack:**
- Hardhat
- Solidity
- OpenZeppelin contracts
- Express.js server
- Ethers.js

**Features:**
- Smart contract deployment
- Product passport NFT minting
- Express API server
- Contract interaction endpoints

**Commands:**
```bash
cd CircularChainBackend
npx hardhat compile        # Compile contracts
npx hardhat test          # Run tests
npx hardhat run scripts/deploy.ts  # Deploy contracts
node server.js            # Start API server
```

## 🧪 Testing

```bash
# Test blockchain contracts
npm run test:backend

# Lint all projects
npm run lint:mobile
npm run lint:frontend
npm run lint:dashboard
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in the respective directories:

**CircularChainBackend/.env:**
```
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### VS Code Configuration

The workspace includes VS Code settings for optimal development experience with:
- ESLint integration
- TypeScript support
- Expo tools
- React development tools

## 📚 API Documentation

### Backend Endpoints

- `GET /api/products/:id` - Get product passport
- `POST /api/products` - Create new product passport
- `POST /api/mint` - Mint product passport NFT

### Smart Contract Functions

- `mintProductPassport()` - Mint new product passport
- `getProductPassport()` - Retrieve product data
- `updateProductPassport()` - Update product information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Documentation](./docs/)
- [Smart Contract Address](./CircularChainBackend/README.md)
- [API Documentation](./CircularChainBackend/API.md)
