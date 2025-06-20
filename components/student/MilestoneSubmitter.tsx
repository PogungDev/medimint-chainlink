'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useMilestoneVerifier } from '@/lib/hooks/useContracts'
import { useToast } from '@/lib/use-toast'

interface MilestoneSubmitterProps {
  tokenId: number
  onMilestoneSubmitted?: () => void
}

const MILESTONE_TYPES = [
  {
    value: 'SEMESTER_1',
    label: 'First Semester Completion',
    description: 'Successfully completed first semester with required GPA',
    scoreImpact: 15
  },
  {
    value: 'SEMESTER_2',
    label: 'Second Semester Completion',
    description: 'Successfully completed second semester with required GPA',
    scoreImpact: 15
  },
  {
    value: 'YEAR_1',
    label: 'First Year Completion',
    description: 'Successfully completed entire first year of medical school',
    scoreImpact: 25
  },
  {
    value: 'CLINICAL_ROTATION',
    label: 'Clinical Rotation',
    description: 'Completed clinical rotation in hospital/medical facility',
    scoreImpact: 20
  },
  {
    value: 'RESEARCH_PROJECT',
    label: 'Research Project',
    description: 'Completed independent research project or publication',
    scoreImpact: 30
  },
  {
    value: 'INTERNSHIP',
    label: 'Medical Internship',
    description: 'Completed medical internship program',
    scoreImpact: 35
  },
  {
    value: 'RESIDENCY_YEAR',
    label: 'Residency Year',
    description: 'Completed year of medical residency',
    scoreImpact: 40
  },
  {
    value: 'BOARD_EXAM',
    label: 'Board Examination',
    description: 'Passed medical board examination',
    scoreImpact: 50
  },
  {
    value: 'GRADUATION',
    label: 'Graduation',
    description: 'Successfully graduated from medical school',
    scoreImpact: 100
  },
  {
    value: 'CERTIFICATION',
    label: 'Professional Certification',
    description: 'Obtained professional medical certification',
    scoreImpact: 75
  }
]

export function MilestoneSubmitter({ tokenId, onMilestoneSubmitted }: MilestoneSubmitterProps) {
  const { address } = useAccount()
  const { toast } = useToast()
  const { submitMilestone, isSubmittingMilestone } = useMilestoneVerifier()

  const [formData, setFormData] = useState({
    milestoneType: '',
    description: '',
    studentId: '',
    additionalNotes: '',
  })

  const [selectedMilestone, setSelectedMilestone] = useState<typeof MILESTONE_TYPES[0] | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'milestoneType') {
      const milestone = MILESTONE_TYPES.find(m => m.value === value)
      setSelectedMilestone(milestone || null)
      if (milestone) {
        setFormData(prev => ({ ...prev, description: milestone.description }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.milestoneType || !formData.description || !formData.studentId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    try {
      if (submitMilestone) {
        submitMilestone({
          args: [
            BigInt(tokenId),
            formData.milestoneType,
            formData.description,
            formData.studentId
          ]
        })
      }
      
      // Reset form
      setFormData({
        milestoneType: '',
        description: '',
        studentId: '',
        additionalNotes: '',
      })
      setSelectedMilestone(null)
      
      onMilestoneSubmitted?.()
      
    } catch (error) {
      console.error('Error submitting milestone:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Submit Milestone</h2>
        <p className="text-gray-600">
          Submit your academic milestone for verification using Chainlink oracles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SBT Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">SBT Information</h4>
              <p className="text-sm text-blue-600 mt-1">
                Token ID: <span className="font-medium">{tokenId}</span>
              </p>
              <p className="text-sm text-blue-600">
                Student Address: <span className="font-mono text-xs">{address}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Type */}
        <div>
          <label htmlFor="milestoneType" className="block text-sm font-medium text-gray-700 mb-2">
            Milestone Type *
          </label>
          <select
            id="milestoneType"
            name="milestoneType"
            value={formData.milestoneType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          >
            <option value="">Select Milestone Type</option>
            {MILESTONE_TYPES.map((milestone) => (
              <option key={milestone.value} value={milestone.value}>
                {milestone.label}
              </option>
            ))}
          </select>
        </div>

        {/* Milestone Preview */}
        {selectedMilestone && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  {selectedMilestone.label}
                </h3>
                <p className="text-sm text-green-700">{selectedMilestone.description}</p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                +{selectedMilestone.scoreImpact} points
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs text-green-600 font-medium">
                💡 This milestone will be verified using Chainlink Functions to check with your institution's API
              </p>
            </div>
          </div>
        )}

        {/* Student ID */}
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
            Student ID *
          </label>
          <input
            type="text"
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleInputChange}
            placeholder="Your institution student ID"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            This ID will be used to verify your milestone with your institution's API
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Milestone Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Describe the milestone you've completed..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            required
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            rows={3}
            placeholder="Any additional information or achievements to highlight..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
        </div>

        {/* Verification Process Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Verification Process</h4>
              <div className="text-sm text-yellow-700 mt-1 space-y-1">
                <p>• Your milestone will be submitted to Chainlink Functions</p>
                <p>• Chainlink oracles will verify with your institution's API</p>
                <p>• Verification typically takes 5-15 minutes</p>
                <p>• You'll receive reputation points upon successful verification</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmittingMilestone || !formData.milestoneType || !formData.studentId}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmittingMilestone ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting for Verification...
              </div>
            ) : (
              'Submit Milestone for Verification'
            )}
          </button>
        </div>
      </form>

      {/* Benefits Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Reputation Points</p>
              <p className="text-sm text-gray-600">Earn points for each verified milestone</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Automated Verification</p>
              <p className="text-sm text-gray-600">Chainlink oracles verify with institutions</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Progress Tracking</p>
              <p className="text-sm text-gray-600">Track your education journey on-chain</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Funding Eligibility</p>
              <p className="text-sm text-gray-600">Maintain compliance for continued funding</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 