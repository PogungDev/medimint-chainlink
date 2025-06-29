'use client';

import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useWaitForTransaction, useNetwork } from 'wagmi';
import { CHAINLINK_ADDRESSES, REPAYMENT_ABI, RepaymentSchedule } from '@/lib/chainlink-contracts';
import { formatUnits } from 'viem';

export function useChainlinkAutomation() {
  const { chain } = useNetwork();
  const [schedules, setSchedules] = useState<RepaymentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = (chain?.id === 11155111 || chain?.id === 31337)
    ? process.env.NEXT_PUBLIC_VAULT_NFT_ADDRESS
    : null;

  // Read active schedules
  const { data: activeSchedules, refetch: refetchSchedules } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: REPAYMENT_ABI,
    functionName: 'getActiveSchedules',
    enabled: !!contractAddress && contractAddress !== '0x0',
    watch: true,
    cacheTime: 15_000, // 15 seconds
  });

  // Check upkeep status
  const { data: upkeepData } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: REPAYMENT_ABI,
    functionName: 'checkUpkeep',
    args: ['0x'], // Empty bytes
    enabled: !!contractAddress && contractAddress !== '0x0',
    watch: true,
    cacheTime: 30_000, // 30 seconds
  });

  // Create repayment schedule
  const { data: createData, write: createRepaymentSchedule, isLoading: isCreating } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: REPAYMENT_ABI,
    functionName: 'createRepaymentSchedule',
  });

  // Manual upkeep trigger (for testing)
  const { data: upkeepTxData, write: performUpkeep, isLoading: isPerforming } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: REPAYMENT_ABI,
    functionName: 'performUpkeep',
  });

  // Wait for transactions
  const { isLoading: isCreateConfirming } = useWaitForTransaction({
    hash: createData?.hash,
    onSuccess: () => refetchSchedules(),
  });

  const { isLoading: isUpkeepConfirming } = useWaitForTransaction({
    hash: upkeepTxData?.hash,
    onSuccess: () => refetchSchedules(),
  });

  // Get specific repayment schedule
  const getRepaymentSchedule = async (vaultId: number): Promise<RepaymentSchedule | null> => {
    if (!contractAddress || contractAddress === '0x0') return null;

    try {
      // This would be implemented as a contract read
      // For now, return a mock schedule
      return {
        monthlyAmount: BigInt(1000 * 10**6), // 1000 USDC
        totalMonths: BigInt(120), // 10 years
        paidMonths: BigInt(0),
        nextPaymentDue: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
      };
    } catch (error) {
      console.error('Error getting repayment schedule:', error);
      return null;
    }
  };

  // Create schedule for vault
  const createScheduleForVault = (vaultId: number, monthlyAmount: bigint, totalMonths: number) => {
    if (createRepaymentSchedule) {
      createRepaymentSchedule({
        args: [BigInt(vaultId), monthlyAmount, BigInt(totalMonths)],
      });
    }
  };

  // Manual trigger upkeep (for demo purposes)
  const triggerUpkeep = () => {
    if (performUpkeep && upkeepData && upkeepData[0]) { // If upkeep is needed
      performUpkeep({
        args: [upkeepData[1]], // Perform data from checkUpkeep
      });
    }
  };

  // Update schedules when data changes
  useEffect(() => {
    if (activeSchedules) {
      // For each active schedule, we would fetch the details
      // For now, just set loading to false
      setIsLoading(false);
      setError(null);
    } else if (contractAddress === '0x0') {
      setError('Contract not deployed');
      setIsLoading(false);
    }
  }, [activeSchedules, contractAddress]);

  // Format USDC amount for display
  const formatUSDC = (amount: bigint): string => {
    return formatUnits(amount, 6); // USDC has 6 decimals
  };

  // Get upkeep status
  const getUpkeepStatus = () => {
    if (!upkeepData) return { needed: false, text: 'Loading...', color: 'gray' };
    
    const upkeepNeeded = upkeepData[0];
    if (upkeepNeeded) {
      return { needed: true, text: 'Upkeep Needed', color: 'orange' };
    } else {
      return { needed: false, text: 'No Upkeep Needed', color: 'green' };
    }
  };

  // Get automation health status
  const getAutomationHealth = () => {
    const activeCount = activeSchedules?.length || 0;
    
    if (activeCount === 0) {
      return { status: 'idle', text: 'No Active Schedules', color: 'gray' };
    } else if (activeCount < 5) {
      return { status: 'healthy', text: `${activeCount} Active Schedules`, color: 'green' };
    } else {
      return { status: 'busy', text: `${activeCount} Active Schedules`, color: 'yellow' };
    }
  };

  // Calculate next payment time
  const getNextPaymentTime = (schedule: RepaymentSchedule): string => {
    const nextPayment = Number(schedule.nextPaymentDue) * 1000; // Convert to milliseconds
    const now = Date.now();
    
    if (nextPayment < now) {
      return 'Overdue';
    }
    
    const diff = nextPayment - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} days`;
    } else if (hours > 0) {
      return `${hours} hours`;
    } else {
      return 'Soon';
    }
  };

  // Calculate payment progress
  const getPaymentProgress = (schedule: RepaymentSchedule): number => {
    const paid = Number(schedule.paidMonths);
    const total = Number(schedule.totalMonths);
    return total > 0 ? (paid / total) * 100 : 0;
  };

  return {
    // Data
    activeSchedules,
    upkeepData,
    schedules,
    
    // Actions
    createScheduleForVault,
    triggerUpkeep,
    getRepaymentSchedule,
    
    // Loading states
    isLoading,
    isCreating,
    isPerforming,
    isCreateConfirming,
    isUpkeepConfirming,
    error,
    
    // Utility functions
    formatUSDC,
    getUpkeepStatus,
    getAutomationHealth,
    getNextPaymentTime,
    getPaymentProgress,
    refetchSchedules,
    
    // Contract info
    contractAddress,
    isContractDeployed: contractAddress && contractAddress !== '0x0',
  };
} 