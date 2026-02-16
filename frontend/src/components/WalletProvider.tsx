/**
 * WalletProvider Component - Shield Wallet Integration
 * Provides Aleo wallet context using Shield Wallet (buildathon requirement)
 */

import { ReactNode, useMemo } from 'react';
import { AleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react';
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield';
import { Network } from '@provablehq/aleo-types';

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const wallets = useMemo(() => [new ShieldWalletAdapter()], []);

  return (
    <AleoWalletProvider
      wallets={wallets}
      network={Network.TESTNET}
      autoConnect={false}
    >
      {children}
    </AleoWalletProvider>
  );
}
