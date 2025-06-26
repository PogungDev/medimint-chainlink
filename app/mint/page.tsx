'use client';

import { useState } from 'react';
import { useVault, demoUtils } from '@/lib/useVault';
import { useAccount } from 'wagmi';

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { mintVault, isMinting, mintTxHash, getArbiScanLink } = useVault();
  
  const [formData, setFormData] = useState({
    educationTrack: 'Medical Specialist Program',
    targetAmount: '30000',
    studentId: 'MED2024001'
  });

  const handleMint = async () => {
    if (!address) return;

    const tokenURI = demoUtils.generateMetadataURI({
      educationTrack: formData.educationTrack,
      targetAmount: parseInt(formData.targetAmount),
      studentId: formData.studentId
    });

    mintVault?.({
      args: [
        address, // student
        BigInt(parseInt(formData.targetAmount) * 1000000), // USDC has 6 decimals
        formData.educationTrack,
        formData.studentId,
        tokenURI
      ]
    });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet First</h1>
          <p>Please connect your wallet to mint a vault</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🎓 Mint Education Vault</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Education Track</label>
              <select 
                value={formData.educationTrack}
                onChange={(e) => setFormData({...formData, educationTrack: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option>Medical Specialist Program</option>
                <option>Medical General Practice</option>
                <option>Medical Surgery</option>
                <option>Medical Research</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Amount (USDC)</label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="30000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Student ID</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="MED2024001"
              />
            </div>

            <button
              onClick={handleMint}
              disabled={isMinting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isMinting ? '⏳ Minting & Fetching Salary...' : '🚀 Mint Vault & Trigger Chainlink'}
            </button>

            {mintTxHash && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold text-green-800">✅ Vault Minted Successfully!</h3>
                <p className="text-sm text-green-600 mt-2">
                  Transaction: <a 
                    href={getArbiScanLink(mintTxHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View on Arbiscan
                  </a>
                </p>
                <p className="text-sm text-green-600 mt-1">
                  🔗 Chainlink Functions is now fetching your salary projection!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="font-bold text-blue-800 mb-4">🔗 What happens next?</h2>
          <ul className="space-y-2 text-blue-700">
            <li>✅ Vault NFT is minted to your address</li>
            <li>⏳ Chainlink Functions fetches salary projection from API</li>
            <li>📊 Salary data is stored on-chain</li>
            <li>💰 Investors can now fund your vault</li>
            <li>🔄 Automation triggers repayment every 5 minutes (demo)</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 