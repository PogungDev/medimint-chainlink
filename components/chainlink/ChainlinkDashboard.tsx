'use client';

import React, { useState } from 'react';
import { useNetwork } from 'wagmi';
import { ChainlinkDataFeedsPanel } from './ChainlinkDataFeedsPanel';
import { ChainlinkVRFPanel } from './ChainlinkVRFPanel';
import { ChainlinkAutomationPanel } from './ChainlinkAutomationPanel';

export function ChainlinkDashboard() {
  const { chain } = useNetwork();
  const [activeTab, setActiveTab] = useState<'overview' | 'datafeeds' | 'vrf' | 'automation'>('overview');

  const isArbitrumSepolia = chain?.id === 421614;

  if (!isArbitrumSepolia) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">🔗 Chainlink Services</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <div className="font-medium text-red-900">Wrong Network</div>
              <div className="text-red-700">Please switch to Arbitrum Sepolia to view Chainlink services.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Network Status */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">🔗 Chainlink Services Status</h2>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm">Live on Arbitrum Sepolia</span>
          </div>
        </div>
        <p className="text-blue-100">
          Comprehensive integration of 5 Chainlink services powering MediMint's medical education funding platform.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Data Feeds */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <h3 className="font-bold text-lg">Data Feeds</h3>
                <p className="text-sm text-gray-600">Price Oracles</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Live</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>ETH/USD Price:</span>
              <span className="font-medium">Real-time</span>
            </div>
            <div className="flex justify-between">
              <span>Investment Multiplier:</span>
              <span className="font-medium text-blue-600">Dynamic</span>
            </div>
            <div className="flex justify-between">
              <span>Update Frequency:</span>
              <span className="font-medium">10 seconds</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('datafeeds')}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            View Details
          </button>
        </div>

        {/* VRF */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🎲</span>
              <div>
                <h3 className="font-bold text-lg">VRF</h3>
                <p className="text-sm text-gray-600">Fair Randomness</p>
              </div>
            </div>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Ready</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Scholarship Lottery:</span>
              <span className="font-medium">Available</span>
            </div>
            <div className="flex justify-between">
              <span>Entry Fee:</span>
              <span className="font-medium text-purple-600">100 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Randomness:</span>
              <span className="font-medium">Provably Fair</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('vrf')}
            className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            View Lottery
          </button>
        </div>

        {/* Automation */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏰</span>
              <div>
                <h3 className="font-bold text-lg">Automation</h3>
                <p className="text-sm text-gray-600">Repayments</p>
              </div>
            </div>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Active</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Check Interval:</span>
              <span className="font-medium">5 minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Active Schedules:</span>
              <span className="font-medium text-orange-600">0</span>
            </div>
            <div className="flex justify-between">
              <span>Auto Processing:</span>
              <span className="font-medium">Enabled</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('automation')}
            className="mt-4 w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
          >
            Manage Automation
          </button>
        </div>

        {/* Functions */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚡</span>
              <div>
                <h3 className="font-bold text-lg">Functions</h3>
                <p className="text-sm text-gray-600">External APIs</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Ready</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Salary API:</span>
              <span className="font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span>Subscription:</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Gas Limit:</span>
              <span className="font-medium">300,000</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-green-600 text-white py-2 rounded text-center">
            Auto-triggered
          </div>
        </div>

        {/* CCIP */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌐</span>
              <div>
                <h3 className="font-bold text-lg">CCIP</h3>
                <p className="text-sm text-gray-600">Cross-chain</p>
              </div>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Planned</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Global Returns:</span>
              <span className="font-medium">Multi-chain</span>
            </div>
            <div className="flex justify-between">
              <span>Supported Chains:</span>
              <span className="font-medium text-indigo-600">5+</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium">In Development</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-400 text-white py-2 rounded text-center cursor-not-allowed">
            Coming Soon
          </div>
        </div>

        {/* Proof of Reserves */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔐</span>
              <div>
                <h3 className="font-bold text-lg">Proof of Reserves</h3>
                <p className="text-sm text-gray-600">Transparency</p>
              </div>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Planned</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Reserve Verification:</span>
              <span className="font-medium">Automated</span>
            </div>
            <div className="flex justify-between">
              <span>Transparency:</span>
              <span className="font-medium text-red-600">100%</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium">In Development</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-400 text-white py-2 rounded text-center cursor-not-allowed">
            Coming Soon
          </div>
        </div>
      </div>

      {/* Integration Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">🏆 Integration Status</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">✅ Fully Integrated</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Data Feeds - Real-time price monitoring
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                VRF - Fair lottery system
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Automation - Repayment processing
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Functions - Salary API integration
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">⚠️ In Development</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                CCIP - Cross-chain returns
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Proof of Reserves - Transparency layer
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Data Streams - Low-latency feeds
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'overview', label: '📊 Overview', icon: '🔗' },
              { key: 'datafeeds', label: '📈 Data Feeds', icon: '📊' },
              { key: 'vrf', label: '🎲 VRF Lottery', icon: '🎲' },
              { key: 'automation', label: '⏰ Automation', icon: '⏰' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'datafeeds' && <ChainlinkDataFeedsPanel />}
        {activeTab === 'vrf' && <ChainlinkVRFPanel />}
        {activeTab === 'automation' && <ChainlinkAutomationPanel />}
      </div>
    </div>
  );
} 