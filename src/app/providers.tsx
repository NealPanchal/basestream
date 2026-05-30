/**
 * providers.tsx — Web3 Provider Stack
 *
 * Wraps the entire app with the necessary providers for:
 * - wagmi (Ethereum interaction hooks)
 * - RainbowKit (wallet connection UI)
 * - TanStack Query (async state management, required by wagmi)
 *
 * Configured for Base chain with a custom dark theme.
 */

'use client';

import React from 'react';

// Polyfill localStorage for SSR build workers if it's missing or broken
if (typeof window === 'undefined') {
  const noop = () => null;
  const noopObj = {
    getItem: noop,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    key: noop,
    length: 0,
  };
  
  if (typeof global.localStorage === 'undefined' || !global.localStorage.getItem) {
    (global as any).localStorage = noopObj;
  }
}
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@rainbow-me/rainbowkit/styles.css';

// ============================================================================
// Configuration
// ============================================================================

/**
 * wagmi + RainbowKit config for Base chain.
 * WalletConnect projectId is required for WalletConnect-based wallets.
 * Get your own at https://cloud.walletconnect.com
 */
const config = getDefaultConfig({
  appName: 'BaseStream',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'basestream_demo_project',
  chains: [base],
  ssr: true,
});

/** TanStack Query client for wagmi's async state */
const queryClient = new QueryClient();

// ============================================================================
// Custom RainbowKit Theme
// ============================================================================

const baseStreamTheme = darkTheme({
  accentColor: '#0052FF',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

// Override specific theme tokens to match Base branding
baseStreamTheme.colors.modalBackground = '#0a0a0b';
baseStreamTheme.colors.modalBorder = 'rgba(255, 255, 255, 0.08)';
baseStreamTheme.colors.profileForeground = '#141519';
baseStreamTheme.colors.connectButtonBackground = '#141519';
baseStreamTheme.colors.connectButtonInnerBackground = '#0a0a0b';
baseStreamTheme.shadows.connectButton = '0 4px 20px rgba(0, 0, 0, 0.5)';

// ============================================================================
// Provider Component
// ============================================================================

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={baseStreamTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
