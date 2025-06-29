'use client';

import { useState, useEffect } from 'react';
import { useVault, useUSDC, useRepayment, demoUtils } from '@/lib/useVault';
import { useAccount } from 'wagmi';
import { useChainlinkDataFeeds } from '@/hooks/useChainlinkDataFeeds';

export default function InvestPage() {
  const { address, isConnected } = useAccount();
  const { vaultId, setVaultId, vaultData, investInVault, isInvesting, investTxHash, getArbiScanLink, refetchVault } = useVault();
  const { approveUSDC, isApproving, approveTxHash, usdcBalance } = useUSDC();
  const { createRepaymentSchedule, isCreatingSchedule, createScheduleTxHash } = useRepayment();
  
  // Chainlink Data Feeds integration
  const {
    currentMultiplier,
    calculateAdjustedInvestment,
    getMultiplierStatus,
    getPriceStatus,
    formatPrice,
    latestPrice,
    updateMultipliers,
    isContractDeployed: isDataFeedsDeployed,
  } = useChainlinkDataFeeds();
  
  const [investmentAmount, setInvestmentAmount] = useState('30000');
  const [adjustedAmount, setAdjustedAmount] = useState<string>('30000');
  const [step, setStep] = useState(1); // 1: Find Vault, 2: Approve USDC, 3: Invest, 4: Create Schedule

  // Calculate adjusted investment amount based on Chainlink Data Feeds
  useEffect(() => {
    if (currentMultiplier && investmentAmount) {
      const baseAmount = parseFloat(investmentAmount);
      const multiplier = Number(currentMultiplier);
      const adjusted = (baseAmount * multiplier) / 100;
      setAdjustedAmount(adjusted.toFixed(2));
    }
  }, [investmentAmount, currentMultiplier]);

  const multiplierStatus = getMultiplierStatus();
  const priceStatus = getPriceStatus();

  const handleApprove = async () => {
    if (!vaultData) return;
    
    // Use adjusted amount if Data Feeds is available, otherwise use base amount
    const finalAmount = isDataFeedsDeployed && adjustedAmount ? adjustedAmount : investmentAmount;
    const amount = BigInt(parseFloat(finalAmount) * 1000000); // USDC 6 decimals
    approveUSDC?.({
      args: [vaultData?.student, amount] // Approve vault contract
    });
  };

  const handleInvest = async () => {
    if (!vaultId) return;
    
    // Use adjusted amount if Data Feeds is available, otherwise use base amount
    const finalAmount = isDataFeedsDeployed && adjustedAmount ? adjustedAmount : investmentAmount;
    const amount = BigInt(parseFloat(finalAmount) * 1000000);
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
        
        {/* Chainlink Data Feeds Status */}
        {isDataFeedsDeployed && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                📊 Live Investment Multiplier
                <span className="ml-2 text-sm bg-green-100 text-green-600 px-2 py-1 rounded">
                  Chainlink Data Feeds
                </span>
              </h2>
              <button
                onClick={() => updateMultipliers?.()}
                className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">ETH/USD Price</span>
                  <span className="text-lg">{priceStatus.emoji}</span>
                </div>
                <div className="text-lg font-bold">
                  ${latestPrice ? formatPrice(latestPrice, 8) : 'Loading...'}
                </div>
                <div className="text-sm text-gray-600">{priceStatus.text}</div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                multiplierStatus.color === 'green' ? 'bg-green-50' :
                multiplierStatus.color === 'red' ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Current Multiplier</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    multiplierStatus.color === 'green' ? 'bg-green-200 text-green-800' :
                    multiplierStatus.color === 'red' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
                  }`}>
                    {multiplierStatus.status}
                  </span>
                </div>
                <div className={`text-lg font-bold ${
                  multiplierStatus.color === 'green' ? 'text-green-900' :
                  multiplierStatus.color === 'red' ? 'text-red-900' : 'text-blue-900'
                }`}>
                  {multiplierStatus.text}
                </div>
                <div className="text-sm text-gray-600">
                  {multiplierStatus.status === 'premium' && '🎉 Bonus returns!'}
                  {multiplierStatus.status === 'discount' && '💡 Discounted opportunity!'}
                  {multiplierStatus.status === 'stable' && '⚖️ Standard terms'}
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Adjusted Investment</span>
                  <span className="text-lg">💰</span>
                </div>
                <div className="text-lg font-bold text-purple-900">
                  ${adjustedAmount} USDC
                </div>
                <div className="text-sm text-gray-600">
                  Base: ${investmentAmount} USDC
                </div>
              </div>
            </div>
            
            {/* Real-time indicator */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium text-blue-900">
                    Investment amount automatically adjusts based on market conditions
                  </span>
                </div>
                <span className="text-xs text-blue-600">Updates every 10 seconds</span>
              </div>
            </div>
          </div>
        )}
        
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
                <label className="block text-sm font-medium mb-2">Base Investment Amount (USDC)</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="30000"
                />
              </div>

              {/* Investment Calculation Display */}
              {isDataFeedsDeployed && currentMultiplier && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">💰 Investment Calculation (Chainlink Adjusted)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base Amount:</span>
                      <span>${investmentAmount} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Chainlink Multiplier:</span>
                      <span className={`font-medium ${
                        multiplierStatus.color === 'green' ? 'text-green-600' :
                        multiplierStatus.color === 'red' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {Number(currentMultiplier)}%
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Final Investment Amount:</span>
                        <span className={`${
                          multiplierStatus.color === 'green' ? 'text-green-600' :
                          multiplierStatus.color === 'red' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          ${adjustedAmount} USDC
                        </span>
                      </div>
                    </div>
                    {Number(currentMultiplier) !== 100 && (
                      <div className={`text-xs ${
                        Number(currentMultiplier) > 100 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Number(currentMultiplier) > 100 ? '🎉 Bonus: ' : '💡 Discount: '}
                        {Number(currentMultiplier) > 100 ? '+' : ''}
                        ${(parseFloat(adjustedAmount) - parseFloat(investmentAmount)).toFixed(2)} USDC
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {isApproving ? '⏳ Approving USDC...' : 
                  `📝 Approve ${isDataFeedsDeployed ? adjustedAmount : investmentAmount} USDC Spending`
                }
              </button>

              {approveTxHash && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">
                    ✅ USDC Approved! 
                    <a href={getArbiScanLink(approveTxHash)} target="_blank" className="underline ml-2">
                      View on Arbiscan
                    </a>
                  </p>
                  {isDataFeedsDeployed && (
                    <p className="text-yellow-600 mt-1 text-sm">
                      📊 Amount adjusted using Chainlink Data Feeds for optimal investment timing
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Invest */}
        {vaultData && approveTxHash && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">💸 Step 3: Invest in Vault</h2>
            
            {/* Final investment summary */}
            {isDataFeedsDeployed && currentMultiplier && (
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Final Investment Amount:</span>
                  <span className="text-lg font-bold text-green-600">${adjustedAmount} USDC</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  📊 Amount optimized using Chainlink Data Feeds
                </div>
              </div>
            )}
            
            <button
              onClick={handleInvest}
              disabled={isInvesting}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isInvesting ? '⏳ Investing...' : 
                `💰 Invest $${isDataFeedsDeployed && adjustedAmount ? adjustedAmount : investmentAmount} USDC`
              }
            </button>

            {investTxHash && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800">
                  ✅ Investment Successful! 
                  <a href={getArbiScanLink(investTxHash)} target="_blank" className="underline ml-2">
                    View on Arbiscan
                  </a>
                </p>
                {isDataFeedsDeployed && (
                  <p className="text-green-600 mt-2 text-sm">
                    🔗 Investment amount was automatically optimized using Chainlink Data Feeds based on current market conditions
                  </p>
                )}
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