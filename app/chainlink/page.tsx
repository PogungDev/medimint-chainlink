'use client';

import { ChainlinkDashboard } from '@/components/chainlink/ChainlinkDashboard';

export default function ChainlinkPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🔗 Chainlink Integration</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive integration of Chainlink services powering MediMint's medical education funding platform.
            Real-time price feeds, verifiable randomness, automated executions, and external data connectivity.
          </p>
        </div>

        {/* Features Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">🚀 Featured Chainlink Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold">Data Feeds</h3>
              <p className="text-sm text-gray-600">Real-time price oracles for investment optimization</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎲</div>
              <h3 className="font-semibold">VRF</h3>
              <p className="text-sm text-gray-600">Provably fair scholarship lottery system</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-semibold">Automation</h3>
              <p className="text-sm text-gray-600">Automated student loan repayments</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold">Functions</h3>
              <p className="text-sm text-gray-600">External API integration for salary data</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <ChainlinkDashboard />

        {/* Technical Information */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🏗️ Technical Implementation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Smart Contracts</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <div>
                    <strong>ChainlinkDataFeeds.sol</strong> - Price monitoring and investment multiplier calculation
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <div>
                    <strong>ChainlinkVRF.sol</strong> - Lottery system with verifiable randomness
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <div>
                    <strong>Repayment.sol</strong> - Automated repayment processing with Keepers
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Frontend Integration</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <div>
                    <strong>Real-time UI Updates</strong> - Live data from Chainlink oracles
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <div>
                    <strong>Investment Calculator</strong> - Dynamic pricing based on market conditions
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <div>
                    <strong>Interactive Lottery</strong> - User-friendly VRF lottery interface
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <div>
                    <strong>Automation Dashboard</strong> - Monitor and manage automated processes
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience Chainlink-Powered DeFi?</h2>
          <p className="mb-6">
            Explore our integrated Chainlink services that make medical education funding more transparent, 
            efficient, and accessible.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/mint"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              🎓 Create Education Vault
            </a>
            <a
              href="/invest"
              className="bg-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors"
            >
              💰 Invest with Live Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 