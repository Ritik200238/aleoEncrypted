/**
 * Mock Wallet Hook (MVP)
 * Simulates wallet connection for testing without real wallet
 *
 * For production: Replace with @demox-labs/aleo-wallet-adapter-react
 */

import { useState, useCallback } from 'react';

export interface MockWalletHook {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  wallet: { adapter: { name: string } } | null;
}

export function useMockWallet(): MockWalletHook {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);

    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate mock Aleo address
    const mockAddress = `aleo1${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    setPublicKey(mockAddress);
    setConnected(true);
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setConnected(false);
  }, []);

  const wallet = connected
    ? { adapter: { name: 'Mock Wallet (MVP)' } }
    : null;

  return {
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    wallet,
  };
}
