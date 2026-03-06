'use client'

import { projectId, wagmiAdapter } from '@/config'
import { arbitrum, mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined')
}

// Set up metadata
const metadata = {
  name: 'IOBIT',
  description: 'Advanced Crypto Trading Platform powered by Hyperliquid',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://app.iobit.ai',
  icons: [process.env.NEXT_PUBLIC_APP_ICON || 'https://avatars.githubusercontent.com/u/179229932']
}

// Initialize AppKit only on the client side (browser) to avoid
// IDBDatabase race conditions on mobile browsers
if (typeof window !== 'undefined') {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [arbitrum, mainnet],
    defaultNetwork: arbitrum,
    metadata: metadata,
    features: {
      analytics: true
    },
    themeMode: 'dark',
    themeVariables: {
      '--w3m-border-radius-master': '0px',
      '--w3m-font-family': 'inherit',
      '--w3m-z-index': 100
    }
  })
}

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  // Create QueryClient per-instance to avoid shared state between SSR requests
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }))

  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
