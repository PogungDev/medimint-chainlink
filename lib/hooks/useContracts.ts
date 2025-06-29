'use client'

import { useContractRead, useContractWrite, useAccount, useNetwork } from 'wagmi'
import { 
  RWA_EDUCATION_NFT_ABI, 
  EDUCATION_SBT_ABI, 
  MILESTONE_VERIFIER_ABI, 
  USDC_ABI,
  getContractAddress,
  type VaultData,
  type InvestorData,
  type SBTMetadata,
  type Milestone
} from '../contracts'
import { parseUnits, formatUnits } from 'viem'
import { useToast } from '../use-toast'

// Hook for RWA Education NFT contract
export function useRWAEducationNFT() {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { toast } = useToast()
  
  const contractAddress = getContractAddress(chain?.id || 80001, 'RWAEducationNFT')

  // Read vault data
  const useVaultData = (tokenId: number) => {
    return useContractRead({
      address: contractAddress as `0x${string}`,
      abi: RWA_EDUCATION_NFT_ABI,
      functionName: 'vaults',
      args: [BigInt(tokenId)],
      enabled: !!tokenId && contractAddress !== '0x0',
    })
  }

  // Read investor data
  const useInvestorData = (tokenId: number, investorAddress?: string) => {
    return useContractRead({
      address: contractAddress as `0x${string}`,
      abi: RWA_EDUCATION_NFT_ABI,
      functionName: 'investors',
      args: [BigInt(tokenId), (investorAddress || address) as `0x${string}`],
      enabled: !!tokenId && !!(investorAddress || address) && contractAddress !== '0x0',
    })
  }

  // Create vault
  const { write: createVault, isLoading: isCreatingVault } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: RWA_EDUCATION_NFT_ABI,
    functionName: 'createVault',
    onSuccess: (data) => {
      toast({
        title: "Vault Created Successfully! 🎉",
        description: `Transaction hash: ${data.hash}`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error Creating Vault",
        description: error.message,
      })
    },
  })

  // Deposit to vault
  const { write: depositToVault, isLoading: isDepositing } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: RWA_EDUCATION_NFT_ABI,
    functionName: 'depositToVault',
    onSuccess: (data) => {
      toast({
        title: "Deposit Successful! 💰",
        description: `Transaction hash: ${data.hash}`,
      })
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
      })
    },
  })

  // Claim platform reward
  const { write: claimPlatformReward, isLoading: isClaimingReward } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: RWA_EDUCATION_NFT_ABI,
    functionName: 'claimPlatformReward',
    onSuccess: (data) => {
      toast({
        title: "Reward Claimed! 🎁",
        description: `Transaction hash: ${data.hash}`,
      })
    },
    onError: (error) => {
      toast({
        title: "Claim Failed",
        description: error.message,
      })
    },
  })

  // Claim fixed return
  const { write: claimFixedReturn, isLoading: isClaimingReturn } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: RWA_EDUCATION_NFT_ABI,
    functionName: 'claimFixedReturn',
    onSuccess: (data) => {
      toast({
        title: "Fixed Return Claimed! 💵",
        description: `Transaction hash: ${data.hash}`,
      })
    },
    onError: (error) => {
      toast({
        title: "Claim Failed",
        description: error.message,
      })
    },
  })

  return {
    contractAddress,
    useVaultData,
    useInvestorData,
    createVault,
    depositToVault,
    claimPlatformReward,
    claimFixedReturn,
    isCreatingVault,
    isDepositing,
    isClaimingReward,
    isClaimingReturn,
  }
}

// Hook for Education SBT contract
export function useEducationSBT() {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { toast } = useToast()
  
  const contractAddress = getContractAddress(chain?.id || 80001, 'EducationSBT')

  // Get SBT data
  const useSBTData = (tokenId: number) => {
    return useContractRead({
      address: contractAddress as `0x${string}`,
      abi: EDUCATION_SBT_ABI,
      functionName: 'getSBTData',
      args: [BigInt(tokenId)],
      enabled: !!tokenId && contractAddress !== '0x0',
    })
  }

  // Get milestones
  const useMilestones = (tokenId: number) => {
    return useContractRead({
      address: contractAddress as `0x${string}`,
      abi: EDUCATION_SBT_ABI,
      functionName: 'getMilestones',
      args: [BigInt(tokenId)],
      enabled: !!tokenId && contractAddress !== '0x0',
    })
  }

  // Get user's token ID
  const useUserTokenId = (userAddress?: string) => {
    return useContractRead({
      address: contractAddress as `0x${string}`,
      abi: EDUCATION_SBT_ABI,
      functionName: 'ownerToTokenId',
      args: [(userAddress || address) as `0x${string}`],
      enabled: !!(userAddress || address) && contractAddress !== '0x0',
    })
  }

  // Mint SBT
  const { write: mintSBT, isLoading: isMintingSBT } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: EDUCATION_SBT_ABI,
    functionName: 'mintSBT',
    onSuccess: (data) => {
      toast({
        title: "SBT Minted Successfully! 🏆",
        description: `Your Education SBT has been created. Transaction: ${data.hash}`,
      })
    },
    onError: (error) => {
      toast({
        title: "SBT Minting Failed",
        description: error.message,
      })
    },
  })

  return {
    contractAddress,
    useSBTData,
    useMilestones,
    useUserTokenId,
    mintSBT,
    isMintingSBT,
  }
}

// Hook for Milestone Verifier contract
export function useMilestoneVerifier() {
  const { chain } = useNetwork()
  const { toast } = useToast()
  
  const contractAddress = getContractAddress(chain?.id || 80001, 'MilestoneVerifier')

  // Submit milestone
  const { write: submitMilestone, isLoading: isSubmittingMilestone } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: MILESTONE_VERIFIER_ABI,
    functionName: 'submitMilestone',
    onSuccess: (data) => {
      toast({
        title: "Milestone Submitted! 📚",
        description: `Your milestone is being verified. Transaction: ${data.hash}`,
      })
    },
    onError: (error) => {
      toast({
        title: "Milestone Submission Failed",
        description: error.message,
      })
    },
  })

  return {
    contractAddress,
    submitMilestone,
    isSubmittingMilestone,
  }
}

// Hook for USDC contract interactions
export function useUSDC() {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { toast } = useToast()
  
  const contractAddress = getContractAddress(chain?.id || 80001, 'USDC')

  // Get USDC balance
  const useUSDCBalance = (userAddress?: string) => {
    return useContractRead({
      address: contractAddress as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [(userAddress || address) as `0x${string}`],
      enabled: !!(userAddress || address) && contractAddress !== '0x0',
    })
  }

  // Get USDC allowance
  const useUSDCAllowance = (spender: string, owner?: string) => {
    return useContractRead({
      address: contractAddress as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [(owner || address) as `0x${string}`, spender as `0x${string}`],
      enabled: !!(owner || address) && !!spender && contractAddress !== '0x0',
    })
  }

  // Approve USDC spending
  const { write: approveUSDC, isLoading: isApprovingUSDC } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'approve',
    onSuccess: (data) => {
      toast({
        title: "USDC Approved! ✅",
        description: `Transaction hash: ${data.hash}`,
      })
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
      })
    },
  })

  return {
    contractAddress,
    useUSDCBalance,
    useUSDCAllowance,
    approveUSDC,
    isApprovingUSDC,
  }
}

// Utility function to format USDC amounts
export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, 6)
}

// Utility function to parse USDC amounts
export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, 6)
} 