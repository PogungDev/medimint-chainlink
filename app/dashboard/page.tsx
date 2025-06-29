'use client';

import { useState, useEffect } from 'react';
import { useVault, useRepayment, demoUtils } from '@/lib/useVault';
import { useAccount, useNetwork } from 'wagmi';
import Link from 'next/link';
import { ChainlinkDashboard } from '@/components/chainlink/ChainlinkDashboard';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { vaultId, setVaultId, vaultData, getArbiScanLink, refetchVault } = useVault();
  const { activeSchedules } = useRepayment();
  
  const [isArbitrumSepolia, setIsArbitrumSepolia] = useState(false);

  useEffect(() => {
    setIsArbitrumSepolia(chain?.id === 421614);
  }, [chain]);

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
          <p>Please connect your wallet to view the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">📊 MediMint A-Z Demo Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Complete overview of your Arbitrum Sepolia deployment and demo progress
          </p>
        </div>

        {/* Network Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🌐 Network Status</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isArbitrumSepolia ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="font-medium">
                {isArbitrumSepolia ? '✅ Arbitrum Sepolia' : '❌ Wrong Network'}
              </p>
              <p className="text-sm text-gray-600">
                {isArbitrumSepolia ? 'Perfect! Ready for demo' : 'Please switch to Arbitrum Sepolia'}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium">🔗 RPC URL</p>
              <p className="text-sm text-gray-600">sepolia-rollup.arbitrum.io</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="font-medium">📊 Explorer</p>
              <a 
                href="https://sepolia.arbiscan.io" 
                target="_blank" 
                className="text-sm text-purple-600 underline"
              >
                sepolia.arbiscan.io
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🚀 A-Z Demo Flow</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              href="/mint"
              className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🎓</div>
                <h3 className="font-bold text-blue-600">Step 1: Student Mint Vault</h3>
                <p className="text-sm text-gray-600">Create vault → Chainlink Functions fetch salary</p>
              </div>
            </Link>
            
            <Link 
              href="/invest"
              className="p-6 border-2 border-green-200 rounded-lg hover:border-green-400 transition-colors"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-bold text-green-600">Step 2: Investor Fund Vault</h3>
                <p className="text-sm text-gray-600">Approve USDC → Invest → Activate automation</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Vault Lookup */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔍 Vault Inspector</h2>
          <div className="flex gap-4 mb-4">
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

          {vaultData && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-bold mb-4">📋 Vault #{vaultData.id?.toString()} Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><strong>Student:</strong> {vaultData.student}</p>
                  <p><strong>Education Track:</strong> {vaultData.educationTrack}</p>
                  <p><strong>Target Amount:</strong> ${demoUtils.formatUSDC(vaultData.targetAmount || BigInt(0))}</p>
                  <p><strong>Current Amount:</strong> ${demoUtils.formatUSDC(vaultData.currentAmount || BigInt(0))}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Projected Salary:</strong> ${vaultData.projectedSalary?.toString() || 'Fetching...'}</p>
                  <p><strong>Salary Fetched:</strong> {vaultData.salaryFetched ? '✅ Yes' : '⏳ Pending'}</p>
                  <p><strong>Status:</strong> {vaultData.isActive ? '🟢 Active' : '🔴 Inactive'}</p>
                  <p><strong>Created:</strong> {new Date(Number(vaultData.createdAt) * 1000).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Progress:</strong> {((Number(vaultData.currentAmount) / Number(vaultData.targetAmount)) * 100).toFixed(1)}% funded
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(((Number(vaultData.currentAmount) / Number(vaultData.targetAmount)) * 100), 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comprehensive Chainlink Dashboard */}
        <div className="mb-6">
          <ChainlinkDashboard />
        </div>

        {/* Demo Proof Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">🏆 Demo Proof for Judges</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">📱 Live Demo Features</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✅ Real Arbitrum Sepolia deployment</li>
                  <li>✅ Live Chainlink Functions integration</li>
                  <li>✅ Live Chainlink Automation (5min intervals)</li>
                  <li>✅ Real USDC transactions</li>
                  <li>✅ Verifiable on Arbiscan</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">🔗 Important Links</h3>
                <div className="space-y-2 text-sm">
                  <a href="https://sepolia.arbiscan.io" target="_blank" className="block text-blue-600 underline">
                    📊 Arbiscan Explorer
                  </a>
                  <a href="https://faucets.chain.link" target="_blank" className="block text-blue-600 underline">
                    💧 Chainlink Faucet
                  </a>
                  <a href="https://functions.chain.link" target="_blank" className="block text-blue-600 underline">
                    ⚡ Functions Management
                  </a>
                  <a href="https://automation.chain.link" target="_blank" className="block text-blue-600 underline">
                    ⏰ Automation Management
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">🎯 A-Z Success Criteria</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Student Flow:</p>
                  <p>Mint vault → Salary fetched → Visible on Arbiscan</p>
                </div>
                <div>
                  <p className="font-medium">Investor Flow:</p>
                  <p>Fund vault → Automation activated → Repayments tracked</p>
                </div>
                <div>
                  <p className="font-medium">Chainlink Proof:</p>
                  <p>Functions + Automation working live with verifiable TX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 