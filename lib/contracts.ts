import { Chain } from 'wagmi'

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  polygonMumbai: {
    RWAEducationNFT: process.env.NEXT_PUBLIC_RWA_EDUCATION_NFT_ADDRESS || '0x0',
    EducationSBT: process.env.NEXT_PUBLIC_EDUCATION_SBT_ADDRESS || '0x0',
    MilestoneVerifier: process.env.NEXT_PUBLIC_MILESTONE_VERIFIER_ADDRESS || '0x0',
    USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  sepolia: {
    RWAEducationNFT: process.env.NEXT_PUBLIC_RWA_EDUCATION_NFT_ADDRESS || '0x0',
    EducationSBT: process.env.NEXT_PUBLIC_EDUCATION_SBT_ADDRESS || '0x0',
    MilestoneVerifier: process.env.NEXT_PUBLIC_MILESTONE_VERIFIER_ADDRESS || '0x0',
    USDC: '0xA0b86a33E6417EfB4F6a0c8b9E7F2Bd7FaBF15b8', // Sepolia USDC
  },
  avalancheFuji: {
    RWAEducationNFT: process.env.NEXT_PUBLIC_RWA_EDUCATION_NFT_ADDRESS || '0x0',
    EducationSBT: process.env.NEXT_PUBLIC_EDUCATION_SBT_ADDRESS || '0x0',
    MilestoneVerifier: process.env.NEXT_PUBLIC_MILESTONE_VERIFIER_ADDRESS || '0x0',
    USDC: '0x5425890298aed601595a70AB815c96711a31Bc65', // Fuji USDC
  },
  arbitrumSepolia: {
    RWAEducationNFT: process.env.NEXT_PUBLIC_RWA_EDUCATION_NFT_ADDRESS || '0x0',
    EducationSBT: process.env.NEXT_PUBLIC_EDUCATION_SBT_ADDRESS || '0x0',
    MilestoneVerifier: process.env.NEXT_PUBLIC_MILESTONE_VERIFIER_ADDRESS || '0x0',
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC
  },
} as const

// RWA Education NFT ABI
export const RWA_EDUCATION_NFT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_usdcAddress", "type": "address" },
      { "internalType": "address", "name": "_usdcPriceFeed", "type": "address" },
      { "internalType": "address", "name": "_platformTreasury", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "investor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "FundsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "beneficiary", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "educationTrack", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "targetAmount", "type": "uint256" }
    ],
    "name": "VaultCreated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "beneficiary", "type": "address" },
      { "internalType": "string", "name": "educationTrack", "type": "string" },
      { "internalType": "uint256", "name": "targetAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "studyDuration", "type": "uint256" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "createVault",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "depositToVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "claimPlatformReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "claimFixedReturn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "vaults",
    "outputs": [
      { "internalType": "uint256", "name": "totalDeposited", "type": "uint256" },
      { "internalType": "uint256", "name": "targetAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "uint256", "name": "studyDuration", "type": "uint256" },
      { "internalType": "address", "name": "beneficiary", "type": "address" },
      { "internalType": "string", "name": "educationTrack", "type": "string" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "uint256", "name": "platformRewardRate", "type": "uint256" },
      { "internalType": "uint256", "name": "fixedAPY", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "investors",
    "outputs": [
      { "internalType": "uint256", "name": "amountDeposited", "type": "uint256" },
      { "internalType": "uint256", "name": "lastRewardClaim", "type": "uint256" },
      { "internalType": "uint256", "name": "lastReturnClaim", "type": "uint256" },
      { "internalType": "bool", "name": "isEligibleForRewards", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Education SBT ABI
export const EDUCATION_SBT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "description", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "scoreImpact", "type": "uint256" }
    ],
    "name": "MilestoneAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "beneficiary", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }
    ],
    "name": "SBTMinted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "beneficiary", "type": "address" },
      { "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "internalType": "string", "name": "educationTrack", "type": "string" },
      { "internalType": "uint256", "name": "totalMilestones", "type": "uint256" }
    ],
    "name": "mintSBT",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "scoreImpact", "type": "uint256" },
      { "internalType": "string", "name": "verificationData", "type": "string" }
    ],
    "name": "addMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getSBTData",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "vaultId", "type": "uint256" },
          { "internalType": "string", "name": "educationTrack", "type": "string" },
          { "internalType": "uint256", "name": "issuedAt", "type": "uint256" },
          { "internalType": "uint256", "name": "reputationScore", "type": "uint256" },
          { "internalType": "uint256", "name": "milestonesCompleted", "type": "uint256" },
          { "internalType": "uint256", "name": "totalMilestones", "type": "uint256" },
          { "internalType": "bool", "name": "isCompliant", "type": "bool" },
          { "internalType": "address", "name": "beneficiary", "type": "address" },
          { "internalType": "string", "name": "currentPhase", "type": "string" }
        ],
        "internalType": "struct EducationSBT.SBTMetadata",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getMilestones",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "completedAt", "type": "uint256" },
          { "internalType": "uint256", "name": "scoreImpact", "type": "uint256" },
          { "internalType": "bool", "name": "isVerified", "type": "bool" },
          { "internalType": "string", "name": "verificationData", "type": "string" }
        ],
        "internalType": "struct EducationSBT.Milestone[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "ownerToTokenId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Milestone Verifier ABI
export const MILESTONE_VERIFIER_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "string", "name": "milestoneType", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "studentId", "type": "string" }
    ],
    "name": "submitMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "milestoneType", "type": "string" },
      { "indexed": false, "internalType": "bytes32", "name": "requestId", "type": "bytes32" }
    ],
    "name": "MilestoneSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "milestoneType", "type": "string" },
      { "indexed": false, "internalType": "bool", "name": "verified", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "scoreImpact", "type": "uint256" }
    ],
    "name": "MilestoneVerified",
    "type": "event"
  }
] as const

// USDC ABI (simplified)
export const USDC_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Helper function to get contract address based on chain
export function getContractAddress(
  chainId: number,
  contractName: keyof (typeof CONTRACT_ADDRESSES)[keyof typeof CONTRACT_ADDRESSES]
): string {
  switch (chainId) {
    case 80001: // Polygon Mumbai
      return CONTRACT_ADDRESSES.polygonMumbai[contractName]
    case 11155111: // Sepolia
      return CONTRACT_ADDRESSES.sepolia[contractName]
    case 43113: // Avalanche Fuji
      return CONTRACT_ADDRESSES.avalancheFuji[contractName]
    case 421614: // Arbitrum Sepolia
      return CONTRACT_ADDRESSES.arbitrumSepolia[contractName]
    default:
      return CONTRACT_ADDRESSES.polygonMumbai[contractName]
  }
}

// Contract types
export interface VaultData {
  totalDeposited: bigint
  targetAmount: bigint
  createdAt: bigint
  studyDuration: bigint
  beneficiary: string
  educationTrack: string
  isActive: boolean
  platformRewardRate: bigint
  fixedAPY: bigint
}

export interface InvestorData {
  amountDeposited: bigint
  lastRewardClaim: bigint
  lastReturnClaim: bigint
  isEligibleForRewards: boolean
}

export interface SBTMetadata {
  vaultId: bigint
  educationTrack: string
  issuedAt: bigint
  reputationScore: bigint
  milestonesCompleted: bigint
  totalMilestones: bigint
  isCompliant: boolean
  beneficiary: string
  currentPhase: string
}

export interface Milestone {
  description: string
  completedAt: bigint
  scoreImpact: bigint
  isVerified: boolean
  verificationData: string
} 