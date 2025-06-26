'use client';

import { useState } from 'react';
import { useVault, useUSDC, useRepayment, demoUtils } from '@/lib/useVault';
import { useAccount } from 'wagmi';

export default function InvestPage() {
  const { address, isConnected } = useAccount();
  const { vaultId, setVaultId, vaultData, investInVault, isInvesting, investTxHash, getArbiScanLink, refetchVault } = useVault();
  const { approveUSDC, isApproving, approveTxHash, usdcBalance } = useUSDC();
  const { createRepaymentSchedule, isCreatingSchedule, createScheduleTxHash } = useRepayment();
  
  const [investmentAmount, setInvestmentAmount] = useState('30000');
  const [step, setStep] = useState(1); // 1: Find Vault, 2: Approve USDC, 3: Invest, 4: Create Schedule

  const handleApprove = async () => {
    if (!vaultData) return;
    
    const amount = BigInt(parseInt(investmentAmount) * 1000000); // USDC 6 decimals
    approveUSDC?.({
      args: [vaultData?.student, amount] // Approve vault contract
    });
  };

  const handleInvest = async () => {
    if (!vaultId) return;
    
    const amount = BigInt(parseInt(investmentAmount) * 1000000);
    investInVault?.({
      args: [BigInt(vaultId), amount]
    });
  };

  const handleCreateSchedule = async () => {
    if (!vaultId) return;
    
    createRepaymentSchedule?.({
      args: [BigInt(vaultId)]
    });
  };

  const loadVault = () => {
    if (vaultId) {
      refetchVault();
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet First</h1>
          <p>Please connect your wallet to invest in vaults</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">💰 Invest in Education Vault</h1>
        
        {/* Step 1: Find Vault */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔍 Step 1: Find Vault</h2>
          <div className="flex gap-4">
            <input
              type="number"
              value={vaultId || ''}
              onChange={(e) => setVaultId(parseInt(e.target.value) || null)}
              placeholder="Enter Vault ID (e.g., 1)"
              className="flex-1 p-3 border rounded-lg"
            />
            <button
              onClick={loadVault}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Load Vault
            </button>
          </div>
        </div>

        {/* Vault Info */}
        {vaultData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📋 Vault Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>Vault ID:</strong> {vaultData.id?.toString()}</p>
                <p><strong>Student:</strong> {vaultData.student}</p>
                <p><strong>Education Track:</strong> {vaultData.educationTrack}</p>
                <p><strong>Target Amount:</strong> ${demoUtils.formatUSDC(vaultData.targetAmount || BigInt(0))}</p>
              </div>
              <div>
                <p><strong>Current Amount:</strong> ${demoUtils.formatUSDC(vaultData.currentAmount || BigInt(0))}</p>
                <p><strong>Projected Salary:</strong> ${vaultData.projectedSalary?.toString() || 'Fetching...'}</p>
                <p><strong>Salary Fetched:</strong> {vaultData.salaryFetched ? '✅ Yes' : '⏳ Pending'}</p>
                <p><strong>Status:</strong> {vaultData.isActive ? '🟢 Active' : '🔴 Inactive'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Approve USDC */}
        {vaultData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📝 Step 2: Approve USDC</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Investment Amount (USDC)</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="30000"
                />
              </div>
              
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {isApproving ? '⏳ Approving USDC...' : '📝 Approve USDC Spending'}
              </button>

              {approveTxHash && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">
                    ✅ USDC Approved! 
                    <a href={getArbiScanLink(approveTxHash)} target="_blank" className="underline ml-2">
                      View on Arbiscan
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Invest */}
        {vaultData && approveTxHash && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">💸 Step 3: Invest in Vault</h2>
            <button
              onClick={handleInvest}
              disabled={isInvesting}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isInvesting ? '⏳ Investing...' : `💰 Invest $${investmentAmount} USDC`}
            </button>

            {investTxHash && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800">
                  ✅ Investment Successful! 
                  <a href={getArbiScanLink(investTxHash)} target="_blank" className="underline ml-2">
                    View on Arbiscan
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Create Repayment Schedule */}
        {vaultData && investTxHash && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📅 Step 4: Create Repayment Schedule</h2>
            <p className="text-gray-600 mb-4">
              This will activate Chainlink Automation for automatic repayments every 5 minutes (demo mode).
            </p>
            
            <button
              onClick={handleCreateSchedule}
              disabled={isCreatingSchedule}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isCreatingSchedule ? '⏳ Creating Schedule...' : '📅 Activate Automation'}
            </button>

            {createScheduleTxHash && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-purple-800">
                  ✅ Repayment Schedule Created! 
                  <a href={getArbiScanLink(createScheduleTxHash)} target="_blank" className="underline ml-2">
                    View on Arbiscan
                  </a>
                </p>
                <p className="text-purple-600 mt-2 text-sm">
                  🔄 Chainlink Automation will now trigger repayments every 5 minutes!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Demo Status */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="font-bold text-blue-800 mb-4">🏆 Demo Status</h2>
          <div className="space-y-2 text-blue-700">
            <p>✅ Vault NFT deployed on Arbitrum Sepolia</p>
            <p>{vaultData ? '✅' : '⏳'} Vault data loaded</p>
            <p>{approveTxHash ? '✅' : '⏳'} USDC approved</p>
            <p>{investTxHash ? '✅' : '⏳'} Investment completed</p>
            <p>{createScheduleTxHash ? '✅' : '⏳'} Automation activated</p>
          </div>
          
          {createScheduleTxHash && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg">
              <p className="font-bold text-green-800">🎉 Demo Complete!</p>
              <p className="text-green-700 text-sm mt-1">
                Monitor Arbiscan for automated repayment transactions every 5 minutes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 