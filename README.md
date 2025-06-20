# 🧬 MediMint - Blockchain Medical Education Funding Platform

<div align="center">
  <img src="./public/logo.png" alt="MediMint Logo" width="120" height="120">
  
  **Transform medical education funding with blockchain technology and fixed-yield returns**
  
  [![Built with Chainlink](https://img.shields.io/badge/Built%20with-Chainlink-375BD2)](https://chain.link/)
  [![Deployed on Polygon](https://img.shields.io/badge/Deployed%20on-Polygon-8247E5)](https://polygon.technology/)
  [![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org/)
  [![Hardhat](https://img.shields.io/badge/Smart%20Contracts-Hardhat-yellow)](https://hardhat.org/)
</div>

## 🌟 Overview

MediMint is the first blockchain platform designed specifically for medical education funding. We turn long-term education into fixed-yield vaults where investors fund medical students and receive guaranteed returns while students get funding with transparent commitment tracking.

### 🎯 Problem We Solve

- **Funding Gap**: Medical education costs $20K-$100K with no returns for 4-6 years
- **Lack of Transparency**: Traditional funding lacks progress tracking and commitment verification
- **Limited Global Access**: Investors can't easily participate in education funding worldwide

### 💡 Our Solution

- **Fixed-Yield Vaults**: 10% APY guaranteed returns starting year 7
- **Soulbound Commitment**: Non-transferable tokens ensuring student accountability
- **Global Accessibility**: Cross-chain payouts via Chainlink CCIP
- **Automated Verification**: Milestone tracking using Chainlink oracles

## 🏗️ Architecture

### Smart Contract Modules

| Contract | Purpose | Chainlink Integration |
|----------|---------|---------------------|
| `RWAEducationNFT.sol` | NFT vault representing education tracks | Data Feeds for USDC pricing |
| `EducationSBT.sol` | Soulbound tokens for commitment tracking | Data Streams for reputation |
| `MilestoneVerifier.sol` | Automated milestone verification | Automation + Functions |
| `CrossChainPayout.sol` | Cross-chain return distribution | CCIP for multi-chain payouts |

### 🔗 Chainlink Integration (7/7 Modules)

- ✅ **Data Feeds**: USDC price monitoring and educational cost index
- ✅ **Data Streams**: Real-time reputation scoring from milestone progress
- ✅ **VRF**: Randomized allocation for sponsored student selection
- ✅ **Proof of Reserve**: Vault backing verification before payouts
- ✅ **Automation**: Automated milestone checking and payout eligibility
- ✅ **Functions**: University API integration for academic verification
- ✅ **CCIP**: Cross-chain returns to global investors

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/medimint/medimint-platform
   cd medimint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Compile smart contracts**
   ```bash
   npm run compile
   ```

5. **Run tests**
   ```bash
   npm test
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

### Deployment

1. **Deploy to testnet**
   ```bash
   npm run deploy:testnet
   ```

2. **Verify contracts**
   ```bash
   npx hardhat verify --network polygonMumbai DEPLOYED_CONTRACT_ADDRESS
   ```

## 💼 User Journeys

### 👥 Investor Flow

1. **Connect Wallet** → Browse available education vaults
2. **Deposit USDC** → Fund a medical student's education (3% platform fee)
3. **Earn Monthly Rewards** → Receive $10-20/month during study period (Years 1-6)
4. **Claim Fixed Returns** → Get 10% APY starting Year 7 for 24 years
5. **Cross-Chain Payouts** → Receive returns on preferred blockchain

### 🎓 Student Flow

1. **Apply for Funding** → Submit education track and milestones
2. **Receive SBT** → Get non-transferable commitment token
3. **Progress Tracking** → Submit semester completions and achievements
4. **Reputation Building** → Maintain high scores through verified milestones
5. **Career Phase** → Begin working and enable investor returns

### 🔧 Platform Flow

1. **Vault Creation** → Create NFT vaults for approved students
2. **Milestone Verification** → Automate progress checking via Chainlink
3. **Reward Distribution** → Manage monthly platform rewards
4. **Return Automation** → Process 10% APY payments to investors

## 📊 Tokenomics & Returns

### Return Structure

| Phase | Timeline | Investor Receives | Source |
|-------|----------|------------------|---------|
| Study Period | Years 1-6 | $10-20/month | Platform reward buffer |
| Working Period | Years 7-30 | 10% APY | Fixed vault returns |

### Example Investment ($10,000)

- **Platform Rewards**: $20 × 12 months × 6 years = $1,440
- **Fixed Returns**: 10% × $10,000 × 24 years = $24,000
- **Total Returns**: $25,440 over 30 years
- **Platform Fee**: 3% of initial deposit = $300

## 🧪 Testing & Validation

### Smart Contract Testing

```bash
# Run comprehensive test suite
npm test

# Run specific test categories
npm run test:vaults
npm run test:sbt
npm run test:chainlink
npm run test:integration
```

### Frontend Testing

```bash
# Run component tests
npm run test:frontend

# Run E2E tests
npm run test:e2e
```

### Chainlink Oracle Testing

```bash
# Test automation
npm run test:automation

# Test functions
npm run test:functions

# Test CCIP
npm run test:ccip
```

## 🌐 Supported Networks

### Testnets
- **Polygon Mumbai** (Primary)
- **Ethereum Sepolia**
- **Avalanche Fuji**
- **Arbitrum Sepolia**

### Mainnets (Coming Soon)
- **Polygon**
- **Ethereum**
- **Avalanche**
- **Arbitrum**

## 📁 Project Structure

```
medimint/
├── contracts/           # Smart contracts
│   ├── core/           # Main vault and token contracts
│   ├── oracles/        # Chainlink integration contracts
│   └── tokens/         # SBT and NFT implementations
├── frontend/           # Next.js application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   └── lib/          # Utilities and hooks
├── backend/           # API and services
│   ├── api/          # API routes
│   ├── db/           # Database schemas
│   └── services/     # Background services
├── test/             # Test suites
│   ├── contracts/    # Smart contract tests
│   ├── integration/  # Integration tests
│   └── frontend/     # Frontend tests
├── scripts/          # Deployment and utility scripts
└── docs/            # Documentation
```

## 🛠️ Technology Stack

### Blockchain
- **Solidity** - Smart contract development
- **Hardhat** - Development environment
- **OpenZeppelin** - Security standards
- **Chainlink** - Oracle infrastructure

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Wagmi** - Ethereum React hooks
- **RainbowKit** - Wallet connection

### Backend
- **Supabase** - Database and authentication
- **Redis** - Caching and real-time features
- **Vercel** - Deployment platform

## 🔐 Security Features

### Smart Contract Security
- **ReentrancyGuard** - Prevents reentrancy attacks
- **AccessControl** - Role-based permissions
- **Pausable** - Emergency stop mechanism
- **Rate Limiting** - Prevents spam and abuse

### Data Security
- **Non-transferable SBTs** - Prevents token trading
- **Milestone Verification** - External API validation
- **Multi-signature** - Enhanced security for critical functions

## 🚦 Roadmap

### Phase 1 (Q1 2024) ✅
- [x] Core smart contracts development
- [x] Chainlink integration (7/7 modules)
- [x] Frontend MVP
- [x] Testnet deployment

### Phase 2 (Q2 2024) 🔄
- [ ] Security audits
- [ ] Mainnet deployment
- [ ] Partnership with medical universities
- [ ] Beta user onboarding

### Phase 3 (Q3 2024) 📅
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] DAO governance implementation
- [ ] Expanded asset support

### Phase 4 (Q4 2024) 📅
- [ ] Multi-chain expansion
- [ ] Institutional investor onboarding
- [ ] AI-powered risk assessment
- [ ] Global university partnerships

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.medimint.com](https://docs.medimint.com)
- **Discord**: [Join our community](https://discord.gg/medimint)
- **Email**: support@medimint.com
- **Twitter**: [@MediMintHQ](https://twitter.com/MediMintHQ)

## 🏆 Recognition

- 🥇 **Chainlink Hackathon Winner** - Most Innovative Use of Oracles
- 🏅 **Polygon Grants** - Education Technology Grant
- 🌟 **Featured** - Chainlink Blog Post about Education DeFi

---

<div align="center">
  <strong>Built with ❤️ for the future of medical education</strong>
  
  [Website](https://medimintplatform1.vercel.app) • [Demo](https://demo.medimint.com) • [Docs](https://docs.medimint.com)
</div> 