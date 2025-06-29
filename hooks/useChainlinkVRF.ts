'use client';

import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useWaitForTransaction, useNetwork } from 'wagmi';
import { CHAINLINK_ADDRESSES, CHAINLINK_VRF_ABI, LotteryInfo } from '@/lib/chainlink-contracts';
import { formatUnits } from 'viem';

export function useChainlinkVRF() {
  const { chain } = useNetwork();
  const [lotteryInfo, setLotteryInfo] = useState<LotteryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = (chain?.id === 11155111 || chain?.id === 31337)
    ? process.env.NEXT_PUBLIC_CHAINLINK_VRF_ADDRESS
    : null;

  // Read current lottery info
  const { data: currentLotteryInfo, refetch: refetchLotteryInfo } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_VRF_ABI,
    functionName: 'getCurrentLotteryInfo',
    enabled: !!contractAddress && contractAddress !== '0x0',
    watch: true,
    cacheTime: 5_000, // 5 seconds
  });

  // Read current round ID
  const { data: currentRoundId } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_VRF_ABI,
    functionName: 'currentRoundId',
    enabled: !!contractAddress && contractAddress !== '0x0',
    watch: true,
    cacheTime: 10_000,
  });

  // Read entry fee
  const { data: entryFee } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_VRF_ABI,
    functionName: 'ENTRY_FEE',
    enabled: !!contractAddress && contractAddress !== '0x0',
    cacheTime: 60_000, // 1 minute (this doesn't change)
  });

  // Read total prize pool
  const { data: totalPrizePool } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_VRF_ABI,
    functionName: 'totalPrizePool',
    enabled: !!contractAddress && contractAddress !== '0x0',
    watch: true,
    cacheTime: 5_000,
  });

  // Start lottery round (admin only)
  const { data: startData, write: startLotteryRound, isLoading: isStarting } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_VRF_ABI,
    functionName: 'startLotteryRound',
  });

  // Enter lottery
  const { data: enterData, write: enterLottery, isLoading: isEntering } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_VRF_ABI,
    functionName: 'enterLottery',
  });

  // Complete lottery round (admin only)
  const { data: completeData, write: completeLotteryRound, isLoading: isCompleting } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_VRF_ABI,
    functionName: 'completeLotteryRound',
  });

  // Wait for transactions
  const { isLoading: isStartConfirming } = useWaitForTransaction({
    hash: startData?.hash,
    onSuccess: () => refetchLotteryInfo(),
  });

  const { isLoading: isEnterConfirming } = useWaitForTransaction({
    hash: enterData?.hash,
    onSuccess: () => refetchLotteryInfo(),
  });

  const { isLoading: isCompleteConfirming } = useWaitForTransaction({
    hash: completeData?.hash,
    onSuccess: () => refetchLotteryInfo(),
  });

  // Check if vault can participate
  const checkVaultEligibility = async (vaultId: number): Promise<{ canParticipate: boolean; reason: string }> => {
    if (!contractAddress || contractAddress === '0x0') {
      return { canParticipate: false, reason: 'Contract not deployed' };
    }

    try {
      // This would need to be implemented as a contract read
      // For now, return a default response
      return { canParticipate: true, reason: 'Eligible to participate' };
    } catch (error) {
      console.error('Error checking vault eligibility:', error);
      return { canParticipate: false, reason: 'Error checking eligibility' };
    }
  };

  // Get round participants
  const getRoundParticipants = async (roundId: number): Promise<bigint[] | null> => {
    if (!contractAddress || contractAddress === '0x0') return null;

    try {
      // This would need to be implemented as a contract read
      // For now, return null
      return null;
    } catch (error) {
      console.error('Error getting round participants:', error);
      return null;
    }
  };

  // Update lottery info when data changes
  useEffect(() => {
    if (currentLotteryInfo) {
      setLotteryInfo({
        roundId: currentLotteryInfo[0],
        participantCount: currentLotteryInfo[1],
        prizePool: currentLotteryInfo[2],
        isActive: currentLotteryInfo[3],
      });
      setIsLoading(false);
      setError(null);
    } else if (contractAddress === '0x0') {
      setError('Contract not deployed');
      setIsLoading(false);
    }
  }, [currentLotteryInfo, contractAddress]);

  // Format USDC amount for display
  const formatUSDC = (amount: bigint): string => {
    return formatUnits(amount, 6); // USDC has 6 decimals
  };

  // Get lottery status with color coding
  const getLotteryStatus = () => {
    if (!lotteryInfo) return { status: 'loading', color: 'gray', text: 'Loading...' };
    
    if (lotteryInfo.isActive) {
      return { 
        status: 'active', 
        color: 'green', 
        text: `Round #${lotteryInfo.roundId.toString()} Active` 
      };
    } else {
      return { 
        status: 'inactive', 
        color: 'red', 
        text: 'No Active Round' 
      };
    }
  };

  // Calculate odds of winning
  const getWinningOdds = (): string => {
    if (!lotteryInfo || lotteryInfo.participantCount === BigInt(0)) {
      return 'N/A';
    }
    
    const odds = (1 / Number(lotteryInfo.participantCount)) * 100;
    return `${odds.toFixed(2)}%`;
  };

  // Enter lottery with vault ID
  const enterLotteryWithVault = (vaultId: number) => {
    if (enterLottery) {
      enterLottery({
        args: [BigInt(vaultId)],
      });
    }
  };

  return {
    // Data
    lotteryInfo,
    currentRoundId,
    entryFee,
    totalPrizePool,
    
    // Actions
    startLotteryRound,
    enterLotteryWithVault,
    completeLotteryRound,
    checkVaultEligibility,
    getRoundParticipants,
    
    // Loading states
    isLoading,
    isStarting,
    isEntering,
    isCompleting,
    isStartConfirming,
    isEnterConfirming,
    isCompleteConfirming,
    error,
    
    // Utility functions
    formatUSDC,
    getLotteryStatus,
    getWinningOdds,
    refetchLotteryInfo,
    
    // Contract info
    contractAddress,
    isContractDeployed: contractAddress && contractAddress !== '0x0',
  };
} 