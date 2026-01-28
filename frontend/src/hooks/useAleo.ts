// Custom hook for Aleo wallet management

import { useState, useCallback } from 'react';
import { aleoService } from '../services/aleoService';
import { storageService } from '../services/storageService';

export function useAleo() {
  const [address, setAddress] = useState<string | null>(
    storageService.loadUserAddress()
  );
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      const userAddress = await aleoService.connectWallet();
      setAddress(userAddress);
      setConnected(true);
      storageService.saveUserAddress(userAddress);
      console.log('✓ Wallet connected:', userAddress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    aleoService.disconnectWallet();
    setAddress(null);
    setConnected(false);
    storageService.clearAll();
    console.log('✓ Wallet disconnected');
  }, []);

  return {
    address,
    connected,
    connecting,
    error,
    connect,
    disconnect,
  };
}
