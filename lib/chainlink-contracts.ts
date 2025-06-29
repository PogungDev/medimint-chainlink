// Chainlink Contract Addresses and ABIs
export const CHAINLINK_ADDRESSES = {
  ethereumSepolia: {
    ChainlinkDataFeeds: process.env.NEXT_PUBLIC_CHAINLINK_DATA_FEEDS_ADDRESS || '0x0',
    ChainlinkVRF: process.env.NEXT_PUBLIC_CHAINLINK_VRF_ADDRESS || '0x0',
    VaultNFT: process.env.NEXT_PUBLIC_VAULT_NFT_ADDRESS || '0x0',
    MockUSDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x0',
    // Chainlink Infrastructure
    ETH_USD_PRICE_FEED: '0x694AA1769357215DE4FAC081bf1f309aDC325306', // ETH/USD on Ethereum Sepolia
    VRF_COORDINATOR: '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625',
    AUTOMATION_REGISTRY: '0x6593c7De001fC8542bB1703532EE1E5aA0D458fD',
  },
  arbitrumSepolia: {
    ChainlinkDataFeeds: process.env.NEXT_PUBLIC_CHAINLINK_DATA_FEEDS_ADDRESS || '0x0',
    ChainlinkVRF: process.env.NEXT_PUBLIC_CHAINLINK_VRF_ADDRESS || '0x0',
    Repayment: process.env.NEXT_PUBLIC_REPAYMENT_ADDRESS || '0x0',
    // Chainlink Infrastructure
    ETH_USD_PRICE_FEED: '0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08', // ETH/USD on Arbitrum Sepolia
    FUNCTIONS_ROUTER: '0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C',
    AUTOMATION_REGISTRY: '0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2',
  }
} as const;

// ChainlinkDataFeeds ABI
export const CHAINLINK_DATA_FEEDS_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_priceFeed", "type": "address" },
      { "internalType": "address", "name": "_vaultContract", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "int256", "name": "newPrice", "type": "int256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "USDCPriceUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "newMultiplier", "type": "uint256" },
      { "indexed": false, "internalType": "int256", "name": "triggerPrice", "type": "int256" }
    ],
    "name": "MultiplierAdjusted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getLatestUSDCPrice",
    "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "updateVaultMultipliers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "baseAmount", "type": "uint256" }],
    "name": "calculateAdjustedInvestment",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUSDCStabilityStatus",
    "outputs": [
      { "internalType": "string", "name": "status", "type": "string" },
      { "internalType": "int256", "name": "currentPrice", "type": "int256" },
      { "internalType": "uint256", "name": "multiplier", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "baseAmount", "type": "uint256" }],
    "name": "simulateInvestment",
    "outputs": [
      { "internalType": "uint256", "name": "adjustedAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "multiplier", "type": "uint256" },
      { "internalType": "string", "name": "priceStatus", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPriceFeedInfo",
    "outputs": [
      { "internalType": "address", "name": "feedAddress", "type": "address" },
      { "internalType": "int256", "name": "latestPrice", "type": "int256" },
      { "internalType": "uint256", "name": "lastUpdate", "type": "uint256" },
      { "internalType": "uint8", "name": "decimals", "type": "uint8" },
      { "internalType": "uint256", "name": "multiplier", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentMultiplier",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastUSDCPrice",
    "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastUpdateTimestamp",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ChainlinkVRF ABI
export const CHAINLINK_VRF_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_vaultContract", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "LotteryRoundStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" }
    ],
    "name": "VaultEntered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "winnerVaultId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "prizeAmount", "type": "uint256" }
    ],
    "name": "WinnerSelected",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "startLotteryRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "vaultId", "type": "uint256" }],
    "name": "enterLottery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "completeLotteryRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentLotteryInfo",
    "outputs": [
      { "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "internalType": "uint256", "name": "participantCount", "type": "uint256" },
      { "internalType": "uint256", "name": "prizePool", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "roundId", "type": "uint256" }],
    "name": "getRoundParticipants",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "vaultId", "type": "uint256" }],
    "name": "canVaultParticipate",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" },
      { "internalType": "string", "name": "reason", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentRoundId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalPrizePool",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ENTRY_FEE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Repayment (Automation) ABI
export const REPAYMENT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_usdcToken", "type": "address" },
      { "internalType": "address", "name": "_vaultNFT", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "monthlyAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "totalMonths", "type": "uint256" }
    ],
    "name": "RepaymentScheduleCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "month", "type": "uint256" }
    ],
    "name": "RepaymentProcessed",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "internalType": "uint256", "name": "monthlyAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "totalMonths", "type": "uint256" }
    ],
    "name": "createRepaymentSchedule",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
    "name": "checkUpkeep",
    "outputs": [
      { "internalType": "bool", "name": "upkeepNeeded", "type": "bool" },
      { "internalType": "bytes", "name": "performData", "type": "bytes" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes", "name": "performData", "type": "bytes" }],
    "name": "performUpkeep",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "vaultId", "type": "uint256" }],
    "name": "getRepaymentSchedule",
    "outputs": [
      { "internalType": "uint256", "name": "monthlyAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "totalMonths", "type": "uint256" },
      { "internalType": "uint256", "name": "paidMonths", "type": "uint256" },
      { "internalType": "uint256", "name": "nextPaymentDue", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveSchedules",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Types
export interface DataFeedsStatus {
  price: bigint;
  multiplier: bigint;
  status: string;
  lastUpdate: bigint;
  feedAddress: string;
  decimals: number;
}

export interface LotteryInfo {
  roundId: bigint;
  participantCount: bigint;
  prizePool: bigint;
  isActive: boolean;
}

export interface RepaymentSchedule {
  monthlyAmount: bigint;
  totalMonths: bigint;
  paidMonths: bigint;
  nextPaymentDue: bigint;
  isActive: boolean;
} 