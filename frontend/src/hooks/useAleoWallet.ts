/**
 * useAleoWallet Hook (Wave 2)
 * React hook for Aleo wallet integration
 *
 * Provides:
 * - Wallet connection state
 * - Connect/disconnect functions
 * - Transaction execution
 * - Network detection
 * - Session persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { WalletAdapter, WalletReadyState } from '@demox-labs/aleo-wallet-adapter-base';
import { aleoWalletService, WalletState } from '../services/aleoWalletService';
import { AleoNetwork } from '../types/aleo';

export interface UseAleoWalletReturn {
  // State
  address: string | null;
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  network: AleoNetwork;
  readyState: WalletReadyState;

  // Actions
  connect: (adapter: WalletAdapter) => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;

  // Utils
  getState: () => WalletState;
}

export function useAleoWallet(): UseAleoWalletReturn {
  const [state, setState] = useState<WalletState>(aleoWalletService.getState());

  // Subscribe to wallet state changes
  useEffect(() => {
    const unsubscribe = aleoWalletService.subscribe('stateChange', (newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Connect wallet
  const connect = useCallback(async (adapter: WalletAdapter) => {
    try {
      await aleoWalletService.connect(adapter);
    } catch (error) {
      console.error('Connect failed:', error);
      throw error;
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await aleoWalletService.disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
      throw error;
    }
  }, []);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    return await aleoWalletService.signMessage(message);
  }, []);

  // Get current state
  const getState = useCallback(() => {
    return aleoWalletService.getState();
  }, []);

  return {
    address: state.address,
    publicKey: state.publicKey,
    connected: state.connected,
    connecting: state.connecting,
    disconnecting: state.disconnecting,
    network: state.network,
    readyState: state.readyState,
    connect,
    disconnect,
    signMessage,
    getState,
  };
}
