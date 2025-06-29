'use client';

import React from 'react';
import { useChainlinkDataFeeds } from '@/hooks/useChainlinkDataFeeds';
import { formatUnits } from 'viem';

export function ChainlinkDataFeedsPanel() {
  const {
    status,
    latestPrice,
    currentMultiplier,
    updateMultipliers,
    isLoading,
    isUpdating,
    isConfirming,
    error,
    formatPrice,
    getMultiplierStatus,
    getPriceStatus,
    isContractDeployed,
  } = useChainlinkDataFeeds();

  if (!isContractDeployed) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          📊 Chainlink Data Feeds
          <span className="ml-2 text-sm bg-red-100 text-red-600 px-2 py-1 rounded">Not Deployed</span>
        </h2>
        <p className="text-gray-600">Contract not deployed on this network.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">📊 Chainlink Data Feeds - Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const multiplierStatus = getMultiplierStatus();
  const priceStatus = getPriceStatus();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          📊 Chainlink Data Feeds
          <span className="ml-2 text-sm bg-green-100 text-green-600 px-2 py-1 rounded">Live</span>
        </h2>
        <button
          onClick={() => updateMultipliers?.()}
          disabled={isUpdating || isConfirming}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating || isConfirming ? 'Updating...' : 'Update Multipliers'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading price data...</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Price Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Price Status</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">ETH/USD Price</span>
                <span className="text-2xl">{priceStatus.emoji}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${latestPrice ? formatPrice(latestPrice, 8) : 'Loading...'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {priceStatus.text}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Last Update</span>
                <span className="text-sm bg-gray-200 px-2 py-1 rounded">Real-time</span>
              </div>
              <div className="text-sm text-gray-600">
                {status?.lastUpdate ? 
                  new Date(Number(status.lastUpdate) * 1000).toLocaleString() 
                  : 'Never'
                }
              </div>
            </div>
          </div>

          {/* Investment Multiplier */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Investment Multiplier</h3>
            
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
              <div className={`text-2xl font-bold ${
                multiplierStatus.color === 'green' ? 'text-green-900' :
                multiplierStatus.color === 'red' ? 'text-red-900' : 'text-blue-900'
              }`}>
                {multiplierStatus.text}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {multiplierStatus.status === 'premium' && '🎉 Investors get bonus returns!'}
                {multiplierStatus.status === 'discount' && '💡 Discounted investment opportunity!'}
                {multiplierStatus.status === 'stable' && '⚖️ Standard investment terms'}
              </div>
            </div>

            {/* Investment Calculator */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Investment Calculator</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Amount:</span>
                  <span>$1,000</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Adjusted Amount:</span>
                  <span className={multiplierStatus.color === 'green' ? 'text-green-600' : 
                                 multiplierStatus.color === 'red' ? 'text-red-600' : 'text-blue-600'}>
                    ${currentMultiplier ? ((1000 * Number(currentMultiplier)) / 100).toFixed(2) : '1000.00'}
                  </span>
                </div>
                {currentMultiplier && Number(currentMultiplier) !== 100 && (
                  <div className={`text-xs ${
                    Number(currentMultiplier) > 100 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Number(currentMultiplier) > 100 ? '+' : ''}
                    ${((Number(currentMultiplier) - 100) * 10).toFixed(2)} difference
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Information */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Contract:</span>
            <div className="font-mono text-xs break-all">{status?.feedAddress || 'Loading...'}</div>
          </div>
          <div>
            <span className="text-gray-600">Decimals:</span>
            <div>{status?.decimals || 8}</div>
          </div>
          <div>
            <span className="text-gray-600">Network:</span>
            <div>Hardhat Local</div>
          </div>
        </div>
      </div>

      {/* Real-time Features */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-medium text-blue-900">Live Price Monitoring</span>
          </div>
          <span className="text-xs text-blue-600">Updates every 10 seconds</span>
        </div>
      </div>
    </div>
  );
} 