/**
 * WalletProvider Component (Wave 2) - PRODUCTION VERSION
 * Provides Aleo wallet context to the entire app
 *
 * Uses @demox-labs/aleo-wallet-adapter-react for wallet management
 */

import { ReactNode, useMemo } from 'react';
import { WalletProvider as AleoWalletProvider } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui';
import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Configure wallet network (testnet by default)
  const network = WalletAdapterNetwork.TestnetBeta;

  // Configure wallet adapters
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: 'EncryptedSocial',
      }),
    ],
    []
  );

  return (
    <AleoWalletProvider
      wallets={wallets}
      network={network}
      decryptPermission="UponRequest"
      autoConnect={false}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </AleoWalletProvider>
  );
}
