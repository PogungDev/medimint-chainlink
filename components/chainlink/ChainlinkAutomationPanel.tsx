'use client';

import React, { useState } from 'react';
import { useChainlinkAutomation } from '@/hooks/useChainlinkAutomation';

export function ChainlinkAutomationPanel() {
  const {
    activeSchedules,
    upkeepData,
    createScheduleForVault,
    triggerUpkeep,
    isLoading,
    isCreating,
    isPerforming,
    isCreateConfirming,
    isUpkeepConfirming,
    error,
    formatUSDC,
    getUpkeepStatus,
    getAutomationHealth,
    isContractDeployed,
  } = useChainlinkAutomation();

  const [newVaultId, setNewVaultId] = useState<number>(1);
  const [monthlyAmount, setMonthlyAmount] = useState<string>('1000');
  const [totalMonths, setTotalMonths] = useState<number>(120);

  if (!isContractDeployed) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          ⏰ Chainlink Automation
          <span className="ml-2 text-sm bg-red-100 text-red-600 px-2 py-1 rounded">Not Deployed</span>
        </h2>
        <p className="text-gray-600">Contract not deployed on this network.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">⏰ Chainlink Automation - Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const upkeepStatus = getUpkeepStatus();
  const automationHealth = getAutomationHealth();

  const handleCreateSchedule = () => {
    const amountInUSDC = BigInt(parseFloat(monthlyAmount) * 10**6); // Convert to USDC with 6 decimals
    createScheduleForVault(newVaultId, amountInUSDC, totalMonths);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          ⏰ Chainlink Automation
          <span className={`ml-2 text-sm px-2 py-1 rounded ${
            automationHealth.color === 'green' ? 'bg-green-100 text-green-600' :
            automationHealth.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {automationHealth.text}
          </span>
        </h2>
        
        <button
          onClick={triggerUpkeep}
          disabled={isPerforming || isUpkeepConfirming || !upkeepStatus.needed}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPerforming || isUpkeepConfirming ? 'Triggering...' : 'Manual Trigger'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2">Loading automation data...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${
              upkeepStatus.color === 'green' ? 'bg-green-50' :
              upkeepStatus.color === 'orange' ? 'bg-orange-50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Upkeep Status</span>
                <span className="text-2xl">
                  {upkeepStatus.needed ? '🔔' : '✅'}
                </span>
              </div>
              <div className={`text-lg font-bold ${
                upkeepStatus.color === 'green' ? 'text-green-900' :
                upkeepStatus.color === 'orange' ? 'text-orange-900' : 'text-gray-900'
              }`}>
                {upkeepStatus.text}
              </div>
              <div className="text-sm text-gray-600">
                {upkeepStatus.needed ? 'Action required' : 'All systems operational'}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Active Schedules</span>
                <span className="text-2xl">📅</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {activeSchedules?.length || 0}
              </div>
              <div className="text-sm text-gray-600">
                Repayment schedules running
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Frequency</span>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                5 min
              </div>
              <div className="text-sm text-gray-600">
                Demo interval (monthly in prod)
              </div>
            </div>
          </div>

          {/* Create New Schedule */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">📝 Create Repayment Schedule</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vault ID
                  </label>
                  <input
                    type="number"
                    value={newVaultId}
                    onChange={(e) => setNewVaultId(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter vault ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Months
                  </label>
                  <input
                    type="number"
                    value={totalMonths}
                    onChange={(e) => setTotalMonths(parseInt(e.target.value) || 120)}
                    min="1"
                    max="360"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="120"
                  />
                </div>

                <button
                  onClick={handleCreateSchedule}
                  disabled={isCreating || isCreateConfirming}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isCreating || isCreateConfirming ? 'Creating Schedule...' : '📅 Create Schedule'}
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Schedule Preview</h4>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-medium">${monthlyAmount} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{totalMonths} months ({(totalMonths/12).toFixed(1)} years)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium text-blue-600">
                        ${(parseFloat(monthlyAmount) * totalMonths).toLocaleString()} USDC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>First Payment:</span>
                      <span className="font-medium">
                        {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  <div className="font-medium mb-1">How Automation Works:</div>
                  <ul className="space-y-1">
                    <li>• Chainlink Keepers check every 5 minutes</li>
                    <li>• Automatically processes due payments</li>
                    <li>• Distributes returns to investors</li>
                    <li>• No manual intervention required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Active Schedules List */}
          {activeSchedules && activeSchedules.length > 0 ? (
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b">
                <h3 className="font-semibold text-lg">📋 Active Repayment Schedules</h3>
              </div>
              <div className="divide-y">
                {activeSchedules.map((scheduleId, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Vault #{scheduleId?.toString()}</div>
                        <div className="text-sm text-gray-600">
                          Automated repayment schedule active
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">Active</div>
                        <div className="text-xs text-gray-500">Next: ~5 min</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="font-semibold text-lg mb-2">No Active Schedules</h3>
              <p className="text-gray-600">
                Create a repayment schedule to see Chainlink Automation in action.
              </p>
            </div>
          )}

          {/* Automation Info */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-orange-900">Chainlink Automation Active</span>
              </div>
              <span className="text-xs text-orange-600">Registry: 0xE16D...8b2</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Automated execution ensures payments are processed on time, every time
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 