'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useRWAEducationNFT, useUSDC, formatUSDC } from '@/lib/hooks/useContracts'
import { useToast } from '@/lib/use-toast'

interface VaultInvestorProps {
  tokenId: number
  onInvestmentComplete?: () => void
}

export function VaultInvestor({ tokenId, onInvestmentComplete }: VaultInvestorProps) {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { openConnectModal } = useConnectModal()
  const { toast } = useToast()
  
  const { 
    useVaultData, 
    useInvestorData, 
    depositToVault, 
    isDepositing,
    contractAddress: vaultContractAddress 
  } = useRWAEducationNFT()
  
  const { 
    useUSDCBalance, 
    useUSDCAllowance, 
    approveUSDC, 
    isApprovingUSDC,
    contractAddress: usdcContractAddress 
  } = useUSDC()

  const [investmentAmount, setInvestmentAmount] = useState('')
  const [needsApproval, setNeedsApproval] = useState(false)

  // Fetch vault data
  const { data: vaultData, isLoading: isLoadingVault } = useVaultData(tokenId)
  
  // Fetch investor data for current user
  const { data: investorData, isLoading: isLoadingInvestor } = useInvestorData(tokenId)
  
  // Fetch USDC balance
  const { data: usdcBalance } = useUSDCBalance()
  
  // Fetch USDC allowance
  const { data: usdcAllowance } = useUSDCAllowance(vaultContractAddress)

  // Check if approval is needed whenever amount or allowance changes
  useEffect(() => {
    if (investmentAmount && usdcAllowance !== undefined) {
      const amountBigInt = BigInt(parseFloat(investmentAmount) * 1000000) // Convert to USDC decimals
      setNeedsApproval(usdcAllowance < amountBigInt)
    } else {
      setNeedsApproval(false)
    }
  }, [investmentAmount, usdcAllowance])

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow positive numbers with up to 6 decimal places
    if (value === '' || /^\d+\.?\d{0,6}$/.test(value)) {
      setInvestmentAmount(value)
    }
  }

  const handleApprove = () => {
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount.",
      })
      return
    }

    if (approveUSDC) {
      approveUSDC({
        args: [vaultContractAddress as `0x${string}`, BigInt(parseFloat(investmentAmount) * 1000000)]
      })
    }
  }

  const handleInvest = () => {
    if (!isConnected) {
      openConnectModal?.()
      return
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount.",
      })
      return
    }

    if (usdcBalance && BigInt(parseFloat(investmentAmount) * 1000000) > usdcBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough USDC for this investment.",
      })
      return
    }

    if (vaultData && vaultData[1] > 0) { // targetAmount > 0
      const remainingAmount = vaultData[1] - vaultData[0] // targetAmount - totalDeposited
      const investmentAmountBigInt = BigInt(parseFloat(investmentAmount) * 1000000)
      
      if (investmentAmountBigInt > remainingAmount) {
        toast({
          title: "Amount Too Large",
          description: `Maximum investment for this vault is ${formatUSDC(remainingAmount)} USDC.`,
        })
        return
      }
    }

    if (depositToVault) {
      depositToVault({
        args: [BigInt(tokenId), BigInt(parseFloat(investmentAmount) * 1000000)]
      })
    }
    setInvestmentAmount('')
    onInvestmentComplete?.()
  }

  if (isLoadingVault) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!vaultData || !vaultData[6]) { // !isActive
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.132 0 2.062-.95 1.886-2.071L18.378 4.929C18.079 3.793 17.074 3 15.925 3H8.075c-1.15 0-2.154.793-2.453 1.929L4.175 16.929c-.176 1.121.754 2.071 1.886 2.071z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Vault Not Available</h3>
          <p className="text-gray-600">This education vault is not currently active for investments.</p>
        </div>
      </div>
    )
  }

  const totalDeposited = vaultData[0]
  const targetAmount = vaultData[1]
  const educationTrack = vaultData[5]
  const beneficiary = vaultData[4]
  
  const progressPercentage = targetAmount > 0 ? Number(totalDeposited * 100n / targetAmount) : 0
  const remainingAmount = targetAmount - totalDeposited

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Invest in Education</h2>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Vault #{tokenId}
          </div>
        </div>
        
        {/* Vault Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{educationTrack}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Beneficiary: <span className="font-mono">{beneficiary}</span>
          </p>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Funding Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{formatUSDC(totalDeposited)} USDC raised</span>
              <span>{formatUSDC(targetAmount)} USDC target</span>
            </div>
          </div>
        </div>

        {/* Investment Form */}
        <div className="space-y-6">
          {/* USDC Balance */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Your USDC Balance</span>
              <span className="text-lg font-semibold text-gray-900">
                {usdcBalance ? formatUSDC(usdcBalance) : '0.00'} USDC
              </span>
            </div>
          </div>

          {/* Current Investment */}
          {investorData && investorData[0] > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">Your Current Investment</span>
                <span className="text-lg font-semibold text-green-900">
                  {formatUSDC(investorData[0])} USDC
                </span>
              </div>
            </div>
          )}

          {/* Investment Amount Input */}
          <div>
            <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                id="investmentAmount"
                value={investmentAmount}
                onChange={handleInvestmentChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-16"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <span className="text-gray-500 font-medium">USDC</span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Minimum: 1 USDC</span>
              <span>Available: {formatUSDC(remainingAmount)} USDC</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {['100', '500', '1000', '5000'].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setInvestmentAmount(amount)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Investment Buttons */}
          <div className="space-y-3">
            {!isConnected ? (
              <button
                onClick={() => openConnectModal?.()}
                className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Connect Wallet to Invest
              </button>
            ) : needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isApprovingUSDC || !investmentAmount}
                className="w-full bg-yellow-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApprovingUSDC ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Approving USDC...
                  </div>
                ) : (
                  'Approve USDC Spending'
                )}
              </button>
            ) : (
              <button
                onClick={handleInvest}
                disabled={isDepositing || !investmentAmount || parseFloat(investmentAmount) <= 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isDepositing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Investment...
                  </div>
                ) : (
                  'Invest in Education'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Investment Benefits */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Monthly Rewards</p>
                <p className="text-sm text-gray-600">$20 USDC monthly during study period</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Fixed Returns</p>
                <p className="text-sm text-gray-600">10% APY after graduation</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Platform Fee</p>
                <p className="text-sm text-gray-600">Only 3% deducted from deposits</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Blockchain Security</p>
                <p className="text-sm text-gray-600">Immutable and transparent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 