'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRWAEducationNFT, formatUSDC } from '@/lib/hooks/useContracts'
import { VaultInvestor } from './VaultInvestor'

// Mock data - in a real app, this would come from subgraph or API
const MOCK_VAULTS = [
  {
    tokenId: 1,
    beneficiary: '0x742d35Cc6634C0532925a3b8D399C3e2DE8a5B61',
    educationTrack: 'Medical Doctor (MD)',
    targetAmount: 50000,
    totalDeposited: 25000,
    studyDuration: 6,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    isActive: true,
  },
  {
    tokenId: 2,
    beneficiary: '0x8ba1f109551bd432803012645hac136c11239318',
    educationTrack: 'Cardiology Specialist',
    targetAmount: 75000,
    totalDeposited: 15000,
    studyDuration: 8,
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    isActive: true,
  },
  {
    tokenId: 3,
    beneficiary: '0x1234567890123456789012345678901234567890',
    educationTrack: 'Pediatric Medicine',
    targetAmount: 60000,
    totalDeposited: 48000,
    studyDuration: 7,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    isActive: true,
  },
]

export function VaultDashboard() {
  const { address, isConnected } = useAccount()
  const [selectedVault, setSelectedVault] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const filteredVaults = MOCK_VAULTS.filter(vault => {
    if (filter === 'active') return vault.totalDeposited < vault.targetAmount
    if (filter === 'completed') return vault.totalDeposited >= vault.targetAmount
    return true
  })

  const VaultCard = ({ vault }: { vault: typeof MOCK_VAULTS[0] }) => {
    const progressPercentage = (vault.totalDeposited / vault.targetAmount) * 100
    const remainingAmount = vault.targetAmount - vault.totalDeposited
    const isCompleted = vault.totalDeposited >= vault.targetAmount

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{vault.educationTrack}</h3>
              <p className="text-blue-100 text-sm">Vault #{vault.tokenId}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white font-semibold text-sm">
                  {vault.studyDuration} Years
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Beneficiary */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Beneficiary</p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {vault.beneficiary}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Funding Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${vault.totalDeposited.toLocaleString()} raised
              </span>
              <span className="font-semibold text-gray-900">
                ${vault.targetAmount.toLocaleString()} target
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                ${remainingAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor((Date.now() - vault.createdAt) / (24 * 60 * 60 * 1000))}
              </p>
              <p className="text-sm text-gray-600">Days Active</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-4">
            {isCompleted ? (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                ✅ Fully Funded
              </div>
            ) : (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                🎯 Seeking Funding
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => setSelectedVault(vault.tokenId)}
            disabled={isCompleted}
            className={`w-full font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isCompleted
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500'
            }`}
          >
            {isCompleted ? 'Fully Funded' : 'Invest Now'}
          </button>
        </div>
      </div>
    )
  }

  if (selectedVault) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setSelectedVault(null)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Vaults
          </button>
        </div>
        <VaultInvestor 
          tokenId={selectedVault} 
          onInvestmentComplete={() => setSelectedVault(null)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Education Vaults</h1>
        <p className="text-xl text-gray-600">
          Invest in the future of medical education and earn fixed returns
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{MOCK_VAULTS.length}</p>
              <p className="text-sm text-gray-600">Total Vaults</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${MOCK_VAULTS.reduce((sum, vault) => sum + vault.totalDeposited, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Raised</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">10%</p>
              <p className="text-sm text-gray-600">Fixed APY</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {MOCK_VAULTS.filter(v => v.totalDeposited < v.targetAmount).length}
              </p>
              <p className="text-sm text-gray-600">Active Vaults</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Vaults ({MOCK_VAULTS.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active ({MOCK_VAULTS.filter(v => v.totalDeposited < v.targetAmount).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
            filter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed ({MOCK_VAULTS.filter(v => v.totalDeposited >= v.targetAmount).length})
        </button>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVaults.map((vault) => (
          <VaultCard key={vault.tokenId} vault={vault} />
        ))}
      </div>

      {filteredVaults.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vaults Found</h3>
          <p className="text-gray-600">No vaults match your current filter criteria.</p>
        </div>
      )}
    </div>
  )
} 