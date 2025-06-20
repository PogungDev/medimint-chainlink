'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useEducationSBT, useMilestoneVerifier } from '@/lib/hooks/useContracts'
import { MilestoneSubmitter } from './MilestoneSubmitter'

// Mock milestone data
const MOCK_MILESTONES = [
  {
    description: "First Year Medical School Completion",
    completedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
    scoreImpact: 20,
    isVerified: true,
    verificationData: "GPA: 3.8, Credits: 30"
  },
  {
    description: "Clinical Rotation - Internal Medicine",
    completedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    scoreImpact: 15,
    isVerified: true,
    verificationData: "Grade: A-, Duration: 8 weeks"
  },
  {
    description: "Research Project Publication",
    completedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    scoreImpact: 25,
    isVerified: true,
    verificationData: "Published in Medical Journal"
  }
]

export function StudentDashboard() {
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [showMilestoneSubmitter, setShowMilestoneSubmitter] = useState(false)
  
  const { useUserTokenId, useSBTData, useMilestones } = useEducationSBT()
  
  // Get user's SBT token ID
  const { data: tokenId } = useUserTokenId()
  
  // Get SBT data
  const { data: sbtData, isLoading: isLoadingSBT } = useSBTData(Number(tokenId) || 0)
  
  // Get milestones (using mock data for now)
  const milestones = MOCK_MILESTONES

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your Education SBT and track your academic progress.
          </p>
          <button
            onClick={() => openConnectModal?.()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (!tokenId || tokenId === BigInt(0)) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.132 0 2.062-.95 1.886-2.071L18.378 4.929C18.079 3.793 17.074 3 15.925 3H8.075c-1.15 0-2.154.793-2.453 1.929L4.175 16.929c-.176 1.121.754 2.071 1.886 2.071z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Education SBT Found</h2>
          <p className="text-gray-600 mb-6">
            You don't have an Education Soulbound Token yet. Please contact your education provider to mint your SBT.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Connected Address:</strong><br />
              <span className="font-mono text-xs">{address}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (showMilestoneSubmitter) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowMilestoneSubmitter(false)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <MilestoneSubmitter 
          tokenId={Number(tokenId)} 
          onMilestoneSubmitted={() => setShowMilestoneSubmitter(false)}
        />
      </div>
    )
  }

  // Mock SBT data if not loaded
  const mockSBTData = {
    vaultId: 1n,
    educationTrack: "Medical Doctor (MD)",
    issuedAt: BigInt(Date.now() - 365 * 24 * 60 * 60 * 1000),
    reputationScore: 160n,
    milestonesCompleted: 3n,
    totalMilestones: 12n,
    isCompliant: true,
    beneficiary: address as string,
    currentPhase: "STUDY"
  }

  const displaySBTData = sbtData || mockSBTData
  const progressPercentage = Number(displaySBTData.milestonesCompleted) / Number(displaySBTData.totalMilestones) * 100

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Dashboard</h1>
        <p className="text-xl text-gray-600">Track your education progress and milestones</p>
      </div>

      {/* SBT Overview Card */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Education Soulbound Token</h2>
            <p className="text-blue-100">Token ID: {tokenId.toString()}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Education Track</h3>
            <p className="text-blue-100">{displaySBTData.educationTrack}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Current Phase</h3>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                displaySBTData.currentPhase === 'STUDY' ? 'bg-yellow-400' :
                displaySBTData.currentPhase === 'WORKING' ? 'bg-green-400' : 'bg-blue-400'
              }`}></div>
              <p className="text-blue-100">{displaySBTData.currentPhase}</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Compliance Status</h3>
            <div className="flex items-center">
              {displaySBTData.isCompliant ? (
                <>
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-100">Compliant</p>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-100">Non-Compliant</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{displaySBTData.reputationScore.toString()}</p>
              <p className="text-sm text-gray-600">Reputation Score</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {displaySBTData.milestonesCompleted.toString()}/{displaySBTData.totalMilestones.toString()}
              </p>
              <p className="text-sm text-gray-600">Milestones</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{progressPercentage.toFixed(0)}%</p>
              <p className="text-sm text-gray-600">Progress</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Education Progress</h3>
          <button
            onClick={() => setShowMilestoneSubmitter(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Submit Milestone
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          {displaySBTData.milestonesCompleted.toString()} of {displaySBTData.totalMilestones.toString()} milestones completed
        </p>
      </div>

      {/* Recent Milestones */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Milestones</h3>
        <div className="space-y-4">
          {milestones.slice(0, 3).map((milestone, index) => (
            <div key={index} className="flex items-start p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{milestone.description}</h4>
                <p className="text-sm text-gray-600 mb-2">{milestone.verificationData}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(milestone.completedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-green-600">
                      +{milestone.scoreImpact} points
                    </span>
                    {milestone.isVerified && (
                      <svg className="w-4 h-4 text-green-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {milestones.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Milestones Yet</h4>
            <p className="text-gray-600 mb-4">Start your education journey by submitting your first milestone.</p>
            <button
              onClick={() => setShowMilestoneSubmitter(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Submit First Milestone
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 