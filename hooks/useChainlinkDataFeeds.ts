'use client';

import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useWaitForTransaction, useNetwork } from 'wagmi';
import { CHAINLINK_ADDRESSES, CHAINLINK_DATA_FEEDS_ABI, DataFeedsStatus } from '@/lib/chainlink-contracts';
import { formatUnits } from 'viem';

export function useChainlinkDataFeeds() {
  const { chain } = useNetwork();
  const [status, setStatus] = useState<DataFeedsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = (chain?.id === 11155111 || chain?.id === 31337)
    ? process.env.NEXT_PUBLIC_CHAINLINK_DATA_FEEDS_ADDRESS
    : null;

  // Read latest USDC price
  const { data: latestPrice } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_DATA_FEEDS_ABI,
    functionName: 'getLatestUSDCPrice',
    enabled: !!contractAddress && contractAddress !== '0x0',
    watch: true,
    cacheTime: 10_000, // 10 seconds
  });

  // Read current multiplier
  const { data: currentMultiplier } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_DATA_FEEDS_ABI,
    functionName: 'currentMultiplier',
    enabled: !!contractAddress && contractAddress !== '0x0',
    watch: true,
    cacheTime: 10_000,
  });

  // Read price feed info
  const { data: priceFeedInfo } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_DATA_FEEDS_ABI,
    functionName: 'getPriceFeedInfo',
    enabled: !!contractAddress && contractAddress !== '0x0',
    watch: true,
    cacheTime: 30_000, // 30 seconds
  });

  // Read USDC stability status
  const { data: stabilityStatus } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_DATA_FEEDS_ABI,
    functionName: 'getUSDCStabilityStatus',
    enabled: !!contractAddress && contractAddress !== '0x0',
    watch: true,
    cacheTime: 10_000,
  });

  // Write function to update multipliers
  const { data: updateData, write: updateMultipliers, isLoading: isUpdating } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: CHAINLINK_DATA_FEEDS_ABI,
    functionName: 'updateVaultMultipliers',
  });

  const { isLoading: isConfirming } = useWaitForTransaction({
    hash: updateData?.hash,
  });

  // Calculate adjusted investment
  const calculateAdjustedInvestment = async (baseAmount: bigint): Promise<bigint | null> => {
    if (!contractAddress || contractAddress === '0x0') return null;
    
    try {
      // This would need to be a contract read call
      // For now, we'll calculate it manually using the current multiplier
      if (currentMultiplier) {
        return (baseAmount * currentMultiplier) / BigInt(100);
      }
      return baseAmount;
    } catch (error) {
      console.error('Error calculating adjusted investment:', error);
      return null;
    }
  };

  // Update status when data changes
  useEffect(() => {
    if (priceFeedInfo && latestPrice !== undefined && currentMultiplier && stabilityStatus) {
      setStatus({
        price: latestPrice,
        multiplier: currentMultiplier,
        status: stabilityStatus[0] || 'UNKNOWN',
        lastUpdate: priceFeedInfo[2],
        feedAddress: priceFeedInfo[0],
        decimals: priceFeedInfo[3],
      });
      setIsLoading(false);
      setError(null);
    } else if (contractAddress === '0x0') {
      setError('Contract not deployed');
      setIsLoading(false);
    }
  }, [priceFeedInfo, latestPrice, currentMultiplier, stabilityStatus, contractAddress]);

  // Format price for display
  const formatPrice = (price: bigint, decimals: number = 8): string => {
    return formatUnits(price, decimals);
  };

  // Get multiplier status with color coding
  const getMultiplierStatus = () => {
    if (!currentMultiplier) return { status: 'loading', color: 'gray', text: 'Loading...' };
    
    const multiplier = Number(currentMultiplier);
    if (multiplier > 100) {
      return { status: 'premium', color: 'green', text: `${multiplier}% Premium` };
    } else if (multiplier < 100) {
      return { status: 'discount', color: 'red', text: `${multiplier}% Discount` };
    } else {
      return { status: 'stable', color: 'blue', text: `${multiplier}% Stable` };
    }
  };

  // Get price status with emoji
  const getPriceStatus = () => {
    if (!stabilityStatus) return { emoji: '⏳', text: 'Loading...' };
    
    const status = stabilityStatus[0];
    switch (status) {
      case 'ABOVE_PEG':
        return { emoji: '📈', text: 'Above Peg (Premium)' };
      case 'BELOW_PEG':
        return { emoji: '📉', text: 'Below Peg (Discount)' };
      case 'STABLE':
        return { emoji: '💰', text: 'Stable at Peg' };
      default:
        return { emoji: '❓', text: 'Unknown Status' };
    }
  };

  return {
    // Data
    status,
    latestPrice,
    currentMultiplier,
    stabilityStatus,
    priceFeedInfo,
    
    // Actions
    updateMultipliers,
    calculateAdjustedInvestment,
    
    // Loading states
    isLoading,
    isUpdating,
    isConfirming,
    error,
    
    // Utility functions
    formatPrice,
    getMultiplierStatus,
    getPriceStatus,
    
    // Contract info
    contractAddress,
    isContractDeployed: contractAddress && contractAddress !== '0x0',
  };
} 