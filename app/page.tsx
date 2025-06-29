'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, Shield, TrendingUp, Users, Zap, Globe } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { VaultDashboard } from '@/components/vault/VaultDashboard'
import { VaultCreator } from '@/components/vault/VaultCreator'
import { StudentDashboard } from '@/components/student/StudentDashboard'

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'home' | 'vaults' | 'create' | 'student'>('home')

  if (currentView === 'vaults') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setCurrentView('home')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">MediMint</span>
              </button>
              
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => setCurrentView('vaults')} 
                  className="text-blue-600 font-medium"
                >
                  Explore Vaults
                </button>
                <button 
                  onClick={() => setCurrentView('create')} 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Create Vault
                </button>
                <button 
                  onClick={() => setCurrentView('student')} 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Student Portal
                </button>
              </div>
              
              <ConnectButton />
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-6 py-8">
          <VaultDashboard />
        </div>
      </div>
    )
  }

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setCurrentView('home')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">MediMint</span>
              </button>
              
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => setCurrentView('vaults')} 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Explore Vaults
                </button>
                <button 
                  onClick={() => setCurrentView('create')} 
                  className="text-blue-600 font-medium"
                >
                  Create Vault
                </button>
                <button 
                  onClick={() => setCurrentView('student')} 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Student Portal
                </button>
              </div>
              
              <ConnectButton />
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-6 py-8">
          <VaultCreator />
        </div>
      </div>
    )
  }

  if (currentView === 'student') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setCurrentView('home')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">MediMint</span>
              </button>
              
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => setCurrentView('vaults')} 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Explore Vaults
                </button>
                <button 
                  onClick={() => setCurrentView('create')} 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Create Vault
                </button>
                <button 
                  onClick={() => setCurrentView('student')} 
                  className="text-blue-600 font-medium"
                >
                  Student Portal
                </button>
              </div>
              
              <ConnectButton />
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-6 py-8">
          <StudentDashboard />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">MediMint</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/mint" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              🎓 Student: Mint Vault
            </Link>
            <Link href="/invest" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
              💰 Investor: Fund Vault
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
              📊 Dashboard
            </Link>
            <Link href="/chainlink" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
              🔗 Chainlink Services
            </Link>
            <button 
              onClick={() => setCurrentView('vaults')} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Legacy Portal
            </button>
          </div>
          
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2" />
            🏆 Chainlink Hackathon Demo • 5 Services Integrated • Ready for Judging
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Revolutionary Medical
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Education RWA
            </span>
            <br />
            Powered by Chainlink
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Solve the <strong>$100B+ medical education crisis</strong> with tokenized funding vaults, 
            featuring complete Chainlink integration: Data Feeds, VRF, Automation, Functions & CCIP.
          </p>

          {/* Chainlink Services Showcase */}
          <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-xs font-medium text-blue-700">Data Feeds</div>
              <div className="text-xs text-gray-600">Price Oracle</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🎲</div>
              <div className="text-xs font-medium text-green-700">VRF</div>
              <div className="text-xs text-gray-600">Fair Lottery</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">⏰</div>
              <div className="text-xs font-medium text-purple-700">Automation</div>
              <div className="text-xs text-gray-600">Auto Repay</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs font-medium text-orange-700">Functions</div>
              <div className="text-xs text-gray-600">API Calls</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🌐</div>
              <div className="text-xs font-medium text-red-700">CCIP</div>
              <div className="text-xs text-gray-600">Cross-Chain</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/mint"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              🎓 Demo: Student Mint Vault
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            
            <Link 
              href="/invest"
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              💰 Demo: Investor Flow
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            >
              📊 Live Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose MediMint?
          </h2>
          <p className="text-xl text-gray-600">
            The first blockchain platform designed specifically for medical education funding
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Fixed 10% APY</h3>
            <p className="text-gray-600">
              Guaranteed returns starting from year 7. No market volatility, just steady income 
              backed by verified career progression.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Soulbound Commitment</h3>
            <p className="text-gray-600">
              Non-transferable tokens track student progress and ensure commitment through 
              milestone verification and reputation scoring.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Cross-Chain Payouts</h3>
            <p className="text-gray-600">
              Receive returns on any supported blockchain via Chainlink CCIP. 
              Perfect for global investors and diaspora funding.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">$1M+</div>
              <div className="text-gray-300">Target TVL Year 1</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">100+</div>
              <div className="text-gray-300">Students to Fund</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">30</div>
              <div className="text-gray-300">Year Lock Period</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">7/7</div>
              <div className="text-gray-300">Chainlink Modules</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Simple, transparent, and automated funding process
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Invest in Education Vaults</h3>
                <p className="text-gray-600">
                  Choose from verified medical students and deposit USDC into tokenized NFT vaults.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Earn Monthly Rewards</h3>
                <p className="text-gray-600">
                  Receive $10-20 monthly platform rewards during the 6-year study period.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Claim Fixed Returns</h3>
                <p className="text-gray-600">
                  Starting year 7, claim 10% APY fixed returns for 24 years as students work.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Start?</h3>
              <p className="text-gray-600 mb-6">
                Join the future of education funding today. Connect your wallet and explore available vaults.
              </p>
              <Link 
                href="/vaults"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">MediMint</span>
            </div>
            
            <div className="flex space-x-6 text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediMint. Built for the future of education funding.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 