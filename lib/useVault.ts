import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { getContractAddress } from './contracts';
import { useNetwork } from 'wagmi';

// Simplified vault ABI for the lite version
const VAULT_ABI = [
  {
    "inputs": [
      {"name": "student", "type": "address"},
      {"name": "targetAmount", "type": "uint256"},
      {"name": "educationTrack", "type": "string"},
      {"name": "studentId", "type": "string"},
      {"name": "tokenURI", "type": "string"}
    ],
    "name": "mintVault",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "vaultId", "type": "uint256"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "investInVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "vaultId", "type": "uint256"}],
    "name": "getVault",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "student", "type": "address"},
          {"name": "targetAmount", "type": "uint256"},
          {"name": "currentAmount", "type": "uint256"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "isActive", "type": "bool"},
          {"name": "educationTrack", "type": "string"},
          {"name": "projectedSalary", "type": "uint256"},
          {"name": "salaryFetched", "type": "bool"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "vaultId", "type": "uint256"}],
    "name": "getVaultInvestors",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "vaultId", "type": "uint256"},
      {"name": "investor", "type": "address"}
    ],
    "name": "getInvestment",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function useVault() {
  const { chain } = useNetwork();
  const [vaultId, setVaultId] = useState<number | null>(null);

  const contractAddress = getContractAddress(chain?.id || 421614, 'VaultNFT');

  // Mint vault function
  const { 
    data: mintData, 
    write: mintVault, 
    isLoading: isMinting 
  } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'mintVault',
  });

  // Invest in vault function
  const { 
    data: investData, 
    write: investInVault, 
    isLoading: isInvesting 
  } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'investInVault',
  });

  // Get vault data
  const { data: vaultData, refetch: refetchVault } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getVault',
    args: vaultId ? [BigInt(vaultId)] : undefined,
    enabled: !!vaultId,
  });

  // Get vault investors
  const { data: vaultInvestors } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getVaultInvestors',
    args: vaultId ? [BigInt(vaultId)] : undefined,
    enabled: !!vaultId,
  });

  // Transaction confirmations
  const { isLoading: isMintConfirming } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const { isLoading: isInvestConfirming } = useWaitForTransaction({
    hash: investData?.hash,
  });

  // Helper function to generate Arbiscan link
  const getArbiScanLink = (txHash: string) => {
    return `https://sepolia.arbiscan.io/tx/${txHash}`;
  };

  return {
    // State
    vaultId,
    setVaultId,
    vaultData,
    vaultInvestors,

    // Actions
    mintVault,
    investInVault,
    refetchVault,

    // Loading states
    isMinting: isMinting || isMintConfirming,
    isInvesting: isInvesting || isInvestConfirming,

    // Transaction hashes for Arbiscan links
    mintTxHash: mintData?.hash,
    investTxHash: investData?.hash,

    // Helper functions
    getArbiScanLink,
    contractAddress,
  };
}

// Helper hook for USDC operations
export function useUSDC() {
  const { chain } = useNetwork();
  const usdcAddress = getContractAddress(chain?.id || 421614, 'USDC');

  const USDC_ABI = [
    {
      "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
      "name": "approve",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
      "name": "allowance",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;

  const { 
    data: approveData, 
    write: approveUSDC, 
    isLoading: isApproving 
  } = useContractWrite({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'approve',
  });

  // Get USDC balance
  const { data: usdcBalance } = useContractRead({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
  });

  return {
    approveUSDC,
    isApproving,
    approveTxHash: approveData?.hash,
    usdcAddress,
    usdcBalance,
  };
}

// Hook for repayment operations
export function useRepayment() {
  const { chain } = useNetwork();
  const repaymentAddress = getContractAddress(chain?.id || 421614, 'Repayment');

  const REPAYMENT_ABI = [
    {
      "inputs": [{"name": "vaultId", "type": "uint256"}],
      "name": "createRepaymentSchedule",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "vaultId", "type": "uint256"}],
      "name": "getRepaymentSchedule",
      "outputs": [
        {
          "components": [
            {"name": "vaultId", "type": "uint256"},
            {"name": "monthlyAmount", "type": "uint256"},
            {"name": "lastPayment", "type": "uint256"},
            {"name": "totalPaid", "type": "uint256"},
            {"name": "totalOwed", "type": "uint256"},
            {"name": "isActive", "type": "bool"}
          ],
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getActiveSchedules",
      "outputs": [{"name": "", "type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;

  const { 
    data: createScheduleData, 
    write: createRepaymentSchedule, 
    isLoading: isCreatingSchedule 
  } = useContractWrite({
    address: repaymentAddress as `0x${string}`,
    abi: REPAYMENT_ABI,
    functionName: 'createRepaymentSchedule',
  });

  // Get active schedules
  const { data: activeSchedules } = useContractRead({
    address: repaymentAddress as `0x${string}`,
    abi: REPAYMENT_ABI,
    functionName: 'getActiveSchedules',
  });

  return {
    createRepaymentSchedule,
    isCreatingSchedule,
    createScheduleTxHash: createScheduleData?.hash,
    activeSchedules,
    repaymentAddress,
  };
}

// Utility functions for demo flow
export const demoUtils = {
  // Format amounts for display
  formatUSDC: (amount: bigint) => {
    return (Number(amount) / 1000000).toLocaleString(); // USDC has 6 decimals
  },

  // Generate sample vault data for demo
  generateSampleVault: () => ({
    student: "0x123...",
    targetAmount: 30000,
    educationTrack: "Medical Specialist Program",
    studentId: "MED2024001",
  }),

  // Generate metadata URI
  generateMetadataURI: (vaultData: any) => {
    const metadata = {
      name: `MediMint Vault #${vaultData.id || 'NEW'}`,
      description: `Education funding vault for ${vaultData.educationTrack}`,
      image: "https://medimint.demo/vault-image.png",
      attributes: [
        { trait_type: "Education Track", value: vaultData.educationTrack },
        { trait_type: "Target Amount", value: `$${vaultData.targetAmount.toLocaleString()}` },
        { trait_type: "Student ID", value: vaultData.studentId }
      ]
    };
    
    // In production, upload to IPFS
    return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
  }
}; 