import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from '../components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MediMint - Blockchain Education Funding',
  description: 'Transform medical education funding with blockchain technology and fixed-yield returns',
  keywords: 'blockchain, medical education, funding, DeFi, NFT, Chainlink',
  authors: [{ name: 'MediMint Team' }],
  openGraph: {
    title: 'MediMint - Blockchain Education Funding',
    description: 'Transform medical education funding with blockchain technology and fixed-yield returns',
    url: 'https://medimintplatform1.vercel.app',
    siteName: 'MediMint',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MediMint Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediMint - Blockchain Education Funding',
    description: 'Transform medical education funding with blockchain technology and fixed-yield returns',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
} 