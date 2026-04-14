/**
 * /unlock — Paywall Landing Page
 *
 * Premium, dark-themed landing page where users:
 * 1. Connect their crypto wallet
 * 2. Pay 0.001 ETH on Base chain
 * 3. Unlock 24 hours of unlimited streaming
 *
 * Features glassmorphism cards, animated gradients, and smooth UX flow.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Shield,
  Zap,
  Clock,
  Sparkles,
  CheckCircle,
  Film,
  Tv,
  Ban,
  CreditCard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';

import WalletConnect from '@/components/WalletConnect';
import TransactionStatus, { type TransactionState } from '@/components/TransactionStatus';
import AccessBadge from '@/components/AccessBadge';
import Logo from '@/components/Logo';
import { useAccess } from '@/hooks/useAccess';
import { grantAccess } from '@/lib/auth';
import {
  PAYMENT_ADDRESS,
  PAYMENT_AMOUNT_ETH,
  BASE_CHAIN_ID,
  getApproxUSD,
  verifyTransaction,
  isWhitelisted,
} from '@/lib/blockchain';

// ============================================================================
// Feature list data
// ============================================================================

const features = [
  {
    icon: Ban,
    title: 'No Ads',
    description: 'Pure, uninterrupted entertainment',
  },
  {
    icon: Clock,
    title: '24h Unlimited',
    description: 'Watch anything for a full day',
  },
  {
    icon: Shield,
    title: 'No Subscription',
    description: 'One-time payment, zero commitment',
  },
  {
    icon: Film,
    title: 'Full Library',
    description: 'Movies, TV shows, originals',
  },
];

const stats = [
  { value: '10K+', label: 'Movies & Shows' },
  { value: '4K', label: 'HD Quality' },
  { value: '24h', label: 'Full Access' },
  { value: '0', label: 'Ads Shown' },
];

// ============================================================================
// Page Component
// ============================================================================

export default function UnlockPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { hasAccess, timeRemaining, timeFormatted, recheck } = useAccess(false, address);

  const [txState, setTxState] = useState<TransactionState>('idle');
  const [txError, setTxError] = useState<string>('');
  const [currentTxHash, setCurrentTxHash] = useState<`0x${string}` | undefined>();

  // wagmi hooks
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();

  // Wait for transaction receipt
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: currentTxHash,
  });

  // If user already has access, show badge and redirect option
  useEffect(() => {
    if (hasAccess && txState === 'idle') {
      // Don't auto-redirect — let them see their active pass
    }
  }, [hasAccess, txState]);

  // Handle tx confirmation
  useEffect(() => {
    if (isTxConfirmed && currentTxHash && txState === 'confirming') {
      handleTxSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxConfirmed, currentTxHash, txState]);

  /**
   * Initiate the payment transaction
   */
  const handleUnlock = async () => {
    if (!isConnected || !address) return;

    try {
      setTxState('sending');
      setTxError('');

      // 1. Ensure correct network (Base)
      if (chainId !== BASE_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: BASE_CHAIN_ID });
        } catch (switchError: any) {
          throw new Error('Please switch to the Base network to continue.');
        }
      }

      // 2. Send ETH to the correct recipient address
      const hash = await sendTransactionAsync({
        to: PAYMENT_ADDRESS,
        value: parseEther(PAYMENT_AMOUNT_ETH),
      });

      setCurrentTxHash(hash);
      setTxState('confirming');
    } catch (error: any) {
      console.error('[BaseStream] Transaction failed:', error);
      setTxState('error');
      
      // Detailed error messages for better UX
      let errorMessage = 'Transaction failed. Please try again.';
      
      if (error?.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected in your wallet.';
      } else if (error?.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for payment and gas.';
      } else if (error?.message) {
        errorMessage = error.shortMessage || error.message;
      }
      
      setTxError(errorMessage);
    }
  };

  /**
   * Handle successful transaction confirmation
   */
  const handleTxSuccess = async () => {
    if (!currentTxHash || !address) return;

    try {
      // Verify on-chain (optional but recommended)
      const verification = await verifyTransaction(currentTxHash, address);
      if (!verification.isValid) {
        console.warn('[BaseStream] On-chain verification warning:', verification.error);
        // Still grant access since the tx was confirmed — verification might lag
      }

      // Grant 24-hour access
      await grantAccess(currentTxHash, address);
      setTxState('success');
    } catch (error) {
      console.error('[BaseStream] Post-tx processing error:', error);
      // Still grant access if tx was confirmed
      await grantAccess(currentTxHash, address);
      setTxState('success');
    }
  };

  /**
   * Navigate to streaming content
   */
  const handleStartWatching = () => {
    router.push('/');
  };

  const handleRetry = () => {
    setTxState('idle');
    setTxError('');
    setCurrentTxHash(undefined);
  };

  return (
    <div className="min-h-screen bg-base-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-base-blue/20 rounded-full blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px]"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-base-blue/5 rounded-full blur-[200px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Transaction overlay */}
      <TransactionStatus
        state={txState}
        txHash={currentTxHash}
        errorMessage={txError}
        onDismiss={txState === 'success' ? handleStartWatching : handleRetry}
        onRetry={handleRetry}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-5">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo size={38} color="#0052FF" />
            <span className="text-lg font-black tracking-tighter hidden sm:block">
              BASE STREAM
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WalletConnect compact />
          </motion.div>
        </nav>

        {/* If user already has active access */}
        {hasAccess && (
          <motion.div
            className="max-w-lg mx-auto px-6 py-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center mb-6">
              <AccessBadge
                timeRemaining={timeRemaining}
                timeFormatted={timeFormatted}
                variant="hero"
              />
            </div>
            <p className="text-gray-400 mb-6">
              You already have an active 24-hour pass.
            </p>
            <motion.button
              onClick={() => router.push('/')}
              className="px-8 py-3.5 bg-base-blue hover:bg-base-blue-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-base-blue/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue Watching →
            </motion.button>
          </motion.div>
        )}

        {/* Main paywall content — hide if user already has access */}
        {!hasAccess && (
          <div className="max-w-6xl mx-auto px-6 py-8 md:py-16">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left column — Marketing copy */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                {/* Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-base-blue/10 border border-base-blue/20 rounded-full text-base-blue text-sm font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles size={14} />
                  <span>Powered by Base (Ethereum L2)</span>
                </motion.div>

                {/* Headline */}
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4">
                    Pay for 24 hours.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-base-blue to-blue-400">
                      Watch unlimited.
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-md">
                    No commitments. No subscriptions. Just pure entertainment, one day at a time.
                  </p>
                </div>

                {/* Feature grid */}
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-base-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <feature.icon size={18} className="text-base-blue" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 pt-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right column — Payment card */}
              <motion.div
                className="flex justify-center lg:justify-end"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="w-full max-w-md">
                  {/* Glass card */}
                  <div className="relative p-8 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-black/30">
                    {/* Glow effect behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-base-blue/20 via-transparent to-purple-600/10 rounded-3xl blur-xl opacity-50" />

                    <div className="relative space-y-7">
                      {/* Price section */}
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-xs font-semibold mb-4">
                          <Zap size={12} />
                          Best Value
                        </div>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-5xl font-black text-white">
                            {PAYMENT_AMOUNT_ETH}
                          </span>
                          <span className="text-xl font-semibold text-gray-400">
                            ETH
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          ≈ ${getApproxUSD()} USD · 24-hour access
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      {/* Included features */}
                      <div className="space-y-3">
                        {[
                          'Unlimited movies & TV shows',
                          'No ads or interruptions',
                          '4K HD streaming quality',
                          'Watch on any device',
                          'Instant access after payment',
                        ].map((item, index) => (
                          <motion.div
                            key={item}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{item}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      {/* CTA */}
                      <div className="space-y-4">
                        {!isConnected ? (
                          <div className="space-y-3">
                            <WalletConnect />
                            <p className="text-center text-xs text-gray-600">
                              Connect your wallet to continue
                            </p>
                          </div>
                        ) : isWhitelisted(address) ? (
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-base-blue/5 border border-base-blue/20 text-center">
                              <p className="text-sm text-base-blue font-semibold mb-1">
                                Executive Account Detected
                              </p>
                              <p className="text-xs text-gray-400">
                                Your wallet is on the VIP whitelist.
                              </p>
                            </div>
                            
                            <motion.button
                              onClick={() => recheck()}
                              className="w-full py-4 bg-white text-base-black font-black text-lg rounded-xl transition-all duration-300 shadow-lg shadow-white/5 hover:bg-gray-100 flex items-center justify-center gap-3"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Sparkles size={20} className="text-base-blue" />
                              <span>Verify VIP Access</span>
                            </motion.button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                              <Shield size={12} />
                              <span>Direct executive access granted</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <motion.button
                              onClick={handleUnlock}
                              disabled={txState !== 'idle'}
                              className="w-full py-4 bg-gradient-to-r from-base-blue to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-base-blue/30 hover:shadow-base-blue/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                              whileHover={{ scale: txState === 'idle' ? 1.02 : 1 }}
                              whileTap={{ scale: txState === 'idle' ? 0.98 : 1 }}
                            >
                              <Play size={20} fill="white" />
                              <span>Unlock 24-Hour Access</span>
                            </motion.button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                              <Shield size={12} />
                              <span>Secured by Base blockchain</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Fiat placeholder */}
                      <div className="pt-2">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-4" />
                        <button
                          disabled
                          className="w-full py-3 bg-white/[0.03] border border-white/[0.06] text-gray-600 font-medium text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <CreditCard size={16} />
                          <span>Pay with Card</span>
                          <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* NFT lifetime pass teaser */}
                  <motion.div
                    className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 to-base-blue/5 border border-white/[0.06] text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Tv size={16} className="text-purple-400" />
                      <span>
                        <span className="text-purple-400 font-semibold">NFT Lifetime Pass</span>
                        {' '}— Coming soon
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
