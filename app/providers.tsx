'use client'

import React from 'react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { polygonMumbai, sepolia, avalancheFuji, arbitrumSepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { infuraProvider } from 'wagmi/providers/infura'
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { rabbyWallet } from '@rainbow-me/rainbowkit/wallets'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, sepolia, avalancheFuji, arbitrumSepolia],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY || 'demo' }),
    publicProvider(),
  ]
)

// Set up wallet connectors
const { wallets } = getDefaultWallets({
  appName: 'MediMint',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo',
  chains,
})

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Popular',
    wallets: [
      rabbyWallet({ chains }),
    ],
  },
])

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider 
          chains={chains}
          theme={{
            blurs: {
              modalOverlay: 'small',
            },
            colors: {
              accentColor: '#3B82F6',
              accentColorForeground: 'white',
              actionButtonBorder: 'rgba(255, 255, 255, 0.04)',
              actionButtonBorderMobile: 'rgba(255, 255, 255, 0.08)',
              actionButtonSecondaryBackground: 'rgba(255, 255, 255, 0.08)',
              closeButton: 'rgba(224, 232, 255, 0.6)',
              closeButtonBackground: 'rgba(255, 255, 255, 0.08)',
              connectButtonBackground: '#3B82F6',
              connectButtonBackgroundError: '#FF494A',
              connectButtonInnerBackground: 'linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15))',
              connectButtonText: 'white',
              connectButtonTextError: 'white',
              connectionIndicator: '#30E000',
              downloadBottomCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #1A1B1F',
              downloadTopCardBackground: 'linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #1A1B1F',
              error: '#FF494A',
              generalBorder: 'rgba(255, 255, 255, 0.08)',
              generalBorderDim: 'rgba(255, 255, 255, 0.04)',
              menuItemBackground: 'rgba(224, 232, 255, 0.1)',
              modalBackdrop: 'rgba(0, 0, 0, 0.3)',
              modalBackground: 'white',
              modalBorder: 'rgba(255, 255, 255, 0.08)',
              modalText: '#1F2937',
              modalTextDim: '#6B7280',
              modalTextSecondary: '#4B5563',
              profileAction: 'rgba(224, 232, 255, 0.1)',
              profileActionHover: 'rgba(224, 232, 255, 0.2)',
              profileForeground: 'white',
              selectedOptionBorder: 'rgba(224, 232, 255, 0.1)',
              standby: '#FFD23F',
            },
            fonts: {
              body: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            },
            radii: {
              actionButton: '12px',
              connectButton: '12px',
              menuButton: '12px',
              modal: '16px',
              modalMobile: '16px',
            },
            shadows: {
              connectButton: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              dialog: '0px 8px 32px rgba(0, 0, 0, 0.32)',
              profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.04)',
              selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.24)',
              selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.12)',
              walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.16)',
            },
          }}
          showRecentTransactions={true}
          coolMode
        >
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
} 