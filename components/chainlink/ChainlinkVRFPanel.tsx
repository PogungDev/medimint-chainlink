'use client';

import React, { useState } from 'react';
import { useChainlinkVRF } from '@/hooks/useChainlinkVRF';

export function ChainlinkVRFPanel() {
  const {
    lotteryInfo,
    entryFee,
    startLotteryRound,
    enterLotteryWithVault,
    completeLotteryRound,
    isLoading,
    isStarting,
    isEntering,
    isCompleting,
    isStartConfirming,
    isEnterConfirming,
    isCompleteConfirming,
    error,
    formatUSDC,
    getLotteryStatus,
    getWinningOdds,
    isContractDeployed,
  } = useChainlinkVRF();

  const [selectedVaultId, setSelectedVaultId] = useState<number>(1);

  if (!isContractDeployed) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          🎲 Chainlink VRF Lottery
          <span className="ml-2 text-sm bg-red-100 text-red-600 px-2 py-1 rounded">Not Deployed</span>
        </h2>
        <p className="text-gray-600">Contract not deployed on this network.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">🎲 Chainlink VRF Lottery - Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const lotteryStatus = getLotteryStatus();
  const winningOdds = getWinningOdds();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          🎲 Chainlink VRF Lottery
          <span className={`ml-2 text-sm px-2 py-1 rounded ${
            lotteryStatus.color === 'green' ? 'bg-green-100 text-green-600' : 
            'bg-red-100 text-red-600'
          }`}>
            {lotteryStatus.text}
          </span>
        </h2>
        
        {/* Admin Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => startLotteryRound?.()}
            disabled={isStarting || isStartConfirming || lotteryInfo?.isActive}
            className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting || isStartConfirming ? 'Starting...' : 'Start Round'}
          </button>
          <button
            onClick={() => completeLotteryRound?.()}
            disabled={isCompleting || isCompleteConfirming || !lotteryInfo?.isActive}
            className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleting || isCompleteConfirming ? 'Completing...' : 'Complete Round'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2">Loading lottery data...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Round Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Round ID</span>
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                #{lotteryInfo?.roundId?.toString() || '0'}
              </div>
              <div className="text-sm text-gray-600">
                {lotteryInfo?.isActive ? 'Active Now' : 'Not Active'}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Participants</span>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {lotteryInfo?.participantCount?.toString() || '0'}
              </div>
              <div className="text-sm text-gray-600">
                Winning Odds: {winningOdds}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Prize Pool</span>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                ${lotteryInfo?.prizePool ? formatUSDC(lotteryInfo.prizePool) : '0'}
              </div>
              <div className="text-sm text-gray-600">
                USDC Rewards
              </div>
            </div>
          </div>

          {/* Entry Section */}
          {lotteryInfo?.isActive && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">🎪 Enter the Lottery</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vault ID to Enter
                    </label>
                    <input
                      type="number"
                      value={selectedVaultId}
                      onChange={(e) => setSelectedVaultId(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your vault ID"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Entry Fee:</span>
                        <span className="font-medium">${entryFee ? formatUSDC(entryFee) : '100'} USDC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current Prize Pool:</span>
                        <span className="font-medium text-green-600">
                          ${lotteryInfo?.prizePool ? formatUSDC(lotteryInfo.prizePool) : '0'} USDC
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Your Winning Odds:</span>
                        <span className="font-medium text-purple-600">{winningOdds}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => enterLotteryWithVault(selectedVaultId)}
                    disabled={isEntering || isEnterConfirming}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isEntering || isEnterConfirming ? 'Entering Lottery...' : '🎲 Enter Lottery'}
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">How It Works</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">1</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Pay Entry Fee</div>
                        <div>Your vault pays the entry fee to join the lottery</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">2</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Chainlink VRF</div>
                        <div>Provably fair randomness selects the winner</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">3</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Win Prize</div>
                        <div>Winner gets the entire prize pool</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Active Round */}
          {!lotteryInfo?.isActive && (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="font-semibold text-lg mb-2">No Active Lottery Round</h3>
              <p className="text-gray-600 mb-4">
                Wait for a new round to start or contact an admin to begin one.
              </p>
              <div className="text-sm text-gray-500">
                Last round participants would have been entered using Chainlink VRF for fair selection
              </div>
            </div>
          )}

          {/* VRF Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-purple-900">Powered by Chainlink VRF</span>
              </div>
              <span className="text-xs text-purple-600">Provably Fair Randomness</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Every lottery uses cryptographically secure randomness that cannot be manipulated
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 