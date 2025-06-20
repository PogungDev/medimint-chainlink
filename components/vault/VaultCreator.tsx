'use client'

import React, { useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useRWAEducationNFT } from '@/lib/hooks/useContracts'
import { useToast } from '@/lib/use-toast'

interface VaultCreatorProps {
  onVaultCreated?: (tokenId: number) => void
}

export function VaultCreator({ onVaultCreated }: VaultCreatorProps) {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { openConnectModal } = useConnectModal()
  const { toast } = useToast()
  
  const { createVault, isCreatingVault, contractAddress } = useRWAEducationNFT()

  const [formData, setFormData] = useState({
    beneficiary: '',
    educationTrack: '',
    targetAmount: '',
    studyDuration: '',
    description: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      openConnectModal?.()
      return
    }

    if (contractAddress === '0x0') {
      toast({
        title: "Contract Not Deployed",
        description: "The RWA Education NFT contract is not deployed on this network.",
      })
      return
    }

    // Basic validation
    if (!formData.beneficiary || !formData.educationTrack || !formData.targetAmount || !formData.studyDuration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.beneficiary)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address for the beneficiary.",
      })
      return
    }

    // Create metadata URI (in a real app, this would be uploaded to IPFS)
    const metadata = {
      name: `MediMint Education Vault - ${formData.educationTrack}`,
      description: formData.description,
      image: `https://medimint.vercel.app/api/vault-image/${encodeURIComponent(formData.educationTrack)}`,
      attributes: [
        { trait_type: "Education Track", value: formData.educationTrack },
        { trait_type: "Target Amount", value: `${formData.targetAmount} USDC` },
        { trait_type: "Study Duration", value: `${formData.studyDuration} years` },
        { trait_type: "Beneficiary", value: formData.beneficiary },
      ]
    }
    
    const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

    try {
      if (createVault) {
        createVault({
          args: [
            formData.beneficiary as `0x${string}`,
            formData.educationTrack,
            BigInt(parseFloat(formData.targetAmount) * 1000000), // Convert to USDC decimals
            BigInt(parseInt(formData.studyDuration)),
            tokenURI
          ]
        })
      }
      
      // Reset form
      setFormData({
        beneficiary: '',
        educationTrack: '',
        targetAmount: '',
        studyDuration: '',
        description: '',
      })
      
    } catch (error) {
      console.error('Error creating vault:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Education Vault</h2>
        <p className="text-gray-600">
          Create a new education funding vault as an NFT that investors can contribute to.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Beneficiary Address */}
        <div>
          <label htmlFor="beneficiary" className="block text-sm font-medium text-gray-700 mb-2">
            Beneficiary Address *
          </label>
          <input
            type="text"
            id="beneficiary"
            name="beneficiary"
            value={formData.beneficiary}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Ethereum address of the student who will receive the education funding
          </p>
        </div>

        {/* Education Track */}
        <div>
          <label htmlFor="educationTrack" className="block text-sm font-medium text-gray-700 mb-2">
            Education Track *
          </label>
          <select
            id="educationTrack"
            name="educationTrack"
            value={formData.educationTrack}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          >
            <option value="">Select Education Track</option>
            <option value="Medical Doctor (MD)">Medical Doctor (MD)</option>
            <option value="Specialist Surgery">Specialist Surgery</option>
            <option value="Pediatric Medicine">Pediatric Medicine</option>
            <option value="Cardiology Specialist">Cardiology Specialist</option>
            <option value="Neurology Specialist">Neurology Specialist</option>
            <option value="Oncology Specialist">Oncology Specialist</option>
            <option value="Emergency Medicine">Emergency Medicine</option>
            <option value="Radiology Specialist">Radiology Specialist</option>
            <option value="Anesthesiology">Anesthesiology</option>
            <option value="Psychiatry">Psychiatry</option>
          </select>
        </div>

        {/* Target Amount */}
        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Target Funding Amount (USDC) *
          </label>
          <input
            type="number"
            id="targetAmount"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleInputChange}
            placeholder="50000"
            min="1000"
            step="100"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Total amount needed for the complete education program
          </p>
        </div>

        {/* Study Duration */}
        <div>
          <label htmlFor="studyDuration" className="block text-sm font-medium text-gray-700 mb-2">
            Study Duration (Years) *
          </label>
          <select
            id="studyDuration"
            name="studyDuration"
            value={formData.studyDuration}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          >
            <option value="">Select Duration</option>
            <option value="4">4 Years (Undergraduate)</option>
            <option value="6">6 Years (Medical School)</option>
            <option value="8">8 Years (MD + Residency)</option>
            <option value="10">10 Years (Specialist Track)</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Program Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Describe the education program, requirements, and expected outcomes..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
        </div>

        {/* Network Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Network Information</h4>
              <p className="text-sm text-blue-600 mt-1">
                Connected to: <span className="font-medium">{chain?.name || 'Unknown Network'}</span>
              </p>
              <p className="text-sm text-blue-600">
                Contract: <span className="font-mono text-xs">{contractAddress}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          {!isConnected ? (
            <button
              type="button"
              onClick={() => openConnectModal?.()}
              className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Connect Wallet to Create Vault
            </button>
          ) : (
            <button
              type="submit"
              disabled={isCreatingVault || contractAddress === '0x0'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isCreatingVault ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Vault...
                </div>
              ) : (
                'Create Education Vault'
              )}
            </button>
          )}
        </div>
      </form>

      {/* Benefits Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vault Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Monthly Rewards</p>
              <p className="text-sm text-gray-600">$20 USDC monthly during study period</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Fixed Returns</p>
              <p className="text-sm text-gray-600">10% APY after graduation</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Blockchain Security</p>
              <p className="text-sm text-gray-600">Immutable and transparent funding</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Progress Tracking</p>
              <p className="text-sm text-gray-600">Automated milestone verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 