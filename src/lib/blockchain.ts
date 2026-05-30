/**
 * blockchain.ts — Base chain payment constants & on-chain verification
 *
 * Handles all blockchain-specific logic including payment configuration,
 * chain setup, and transaction verification against the Base L2 network.
 */

import { createPublicClient, http, parseEther, formatEther, isAddressEqual } from 'viem';
import { base } from 'viem/chains';

/** BaseScan API configuration */
export const BASESCAN_API_URL = 'https://api.basescan.org/api';


// ============================================================================
// Payment Configuration
// ============================================================================

/** Wallet address that receives streaming access payments */
export const PAYMENT_ADDRESS = '0xe1E62DE063D50F0643114bE328A0C868439d9E80' as const;

/** VIP addresses with direct lifetime access */
export const WHITELIST_ADDRESSES = [
  '0x5041A07E593E94747881cd12C49ba5f1545512e2',
  '0x287B63C962ace27b947Dad18978D8A66219CbC2e'
].map(addr => addr.toLowerCase());

/** Check if an address is in the VIP whitelist */
export const isWhitelisted = (address: string | undefined): boolean => {
  if (!address) return false;
  return WHITELIST_ADDRESSES.includes(address.toLowerCase());
};


/** Cost for 24-hour unlimited streaming access (in ETH) */
export const PAYMENT_AMOUNT_ETH = '0.001';

/** Cost in wei for smart contract / transaction value */
export const PAYMENT_AMOUNT_WEI = parseEther(PAYMENT_AMOUNT_ETH);

/** Base chain ID */
export const BASE_CHAIN_ID = 8453;

/** Access duration in milliseconds (24 hours) */
export const ACCESS_DURATION_MS = 24 * 60 * 60 * 1000;

/** Approximate ETH/USD rate for display (updated periodically) */
export const APPROX_ETH_USD = 3200;

// ============================================================================
// Public Client (for read-only on-chain queries)
// ============================================================================

/**
 * Viem public client for Base chain.
 * Used to verify transactions on-chain without requiring a connected wallet.
 */
export const basePublicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

// ============================================================================
// Transaction Verification
// ============================================================================

export interface TransactionVerification {
  isValid: boolean;
  error?: string;
  blockNumber?: bigint;
  from?: string;
  to?: string;
  value?: string;
}

/**
 * Verify a transaction hash on-chain to confirm:
 * 1. The transaction exists and is confirmed
 * 2. It was sent to the correct payment address
 * 3. The value meets or exceeds the required amount
 *
 * @param txHash - The transaction hash to verify
 * @param expectedFrom - Optional: verify the sender address
 * @returns Verification result with details
 */
export async function verifyTransaction(
  txHash: `0x${string}`,
  expectedFrom?: string
): Promise<TransactionVerification> {
  try {
    // Fetch the transaction receipt to confirm it's mined
    const receipt = await basePublicClient.getTransactionReceipt({
      hash: txHash,
    });

    if (!receipt) {
      return { isValid: false, error: 'Transaction not found or not yet confirmed' };
    }

    if (receipt.status !== 'success') {
      return { isValid: false, error: 'Transaction reverted on-chain' };
    }

    // Fetch the full transaction to check value and recipient
    const tx = await basePublicClient.getTransaction({
      hash: txHash,
    });

    if (!tx) {
      return { isValid: false, error: 'Transaction data not found' };
    }

    // Verify recipient
    if (tx.to?.toLowerCase() !== PAYMENT_ADDRESS.toLowerCase()) {
      return {
        isValid: false,
        error: 'Transaction was not sent to the correct payment address',
      };
    }

    // Verify amount (must be >= required payment)
    if (tx.value < PAYMENT_AMOUNT_WEI) {
      return {
        isValid: false,
        error: `Insufficient payment: sent ${formatEther(tx.value)} ETH, required ${PAYMENT_AMOUNT_ETH} ETH`,
      };
    }

    // Verify sender if specified
    if (expectedFrom && tx.from.toLowerCase() !== expectedFrom.toLowerCase()) {
      return {
        isValid: false,
        error: 'Transaction was sent from a different wallet',
      };
    }

    return {
      isValid: true,
      blockNumber: receipt.blockNumber,
      from: tx.from,
      to: tx.to,
      value: formatEther(tx.value),
    };
  } catch (error) {
    console.error('Transaction verification failed:', error);
    return {
      isValid: false,
      error: 'Failed to verify transaction on-chain. Please try again.',
    };
  }
}

/**
 * Check if an address has sent the required payment to the recipient
 * address within the last 24 hours by scanning transaction history.
 *
 * @param userAddress - The wallet address to check
 * @returns Transaction hash if payment found, null otherwise
 */
export async function checkRecentPayment(userAddress: string): Promise<string | null> {
  if (!userAddress) return null;

  try {
    // Note: In production, we would use an API key. 
    // For local dev/demo, we use the public endpoint.
    const url = `${BASESCAN_API_URL}?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&sort=desc&offset=100`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1' || !Array.isArray(data.result)) {
      console.warn('[BaseStream] Could not fetch transaction history:', data.message);
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const twentyFourHoursAgo = now - 86400;

    // Look for a successful transaction to our payment address with the correct value
    const validTx = data.result.find((tx: any) => {
      const isCorrectRecipient = isAddressEqual(tx.to as `0x${string}`, PAYMENT_ADDRESS);
      const isPast24h = parseInt(tx.timeStamp) > twentyFourHoursAgo;
      const isSuccess = tx.isError === '0';
      const isCorrectValue = tx.value === PAYMENT_AMOUNT_WEI.toString();

      return isCorrectRecipient && isPast24h && isSuccess && isCorrectValue;
    });

    return validTx ? validTx.hash : null;
  } catch (error) {
    console.error('[BaseStream] Error checking recent payment:', error);
    return null;
  }
}

/**
 * Get a shortened, display-friendly version of an Ethereum address.
 * Example: 0x1234...5678
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Get the approximate USD value of the payment amount.
 */
export function getApproxUSD(): string {
  const usd = parseFloat(PAYMENT_AMOUNT_ETH) * APPROX_ETH_USD;
  return usd.toFixed(2);
}
