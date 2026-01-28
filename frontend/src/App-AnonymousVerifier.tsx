/**
 * Anonymous Group Verifier - Simplified App
 * Pivot implementation for Aleo Buildathon
 *
 * 3 Simple Pages:
 * 1. Create Organization
 * 2. Submit Feedback
 * 3. View Feedback
 */

import React, { useState, useEffect } from 'react';
import { CreateOrganization } from './pages/CreateOrganization';
import { SubmitFeedback } from './pages/SubmitFeedback';
import { ViewFeedback } from './pages/ViewFeedback';
import { groupMembershipService } from './services/groupMembershipService';

type Page = 'home' | 'create' | 'submit' | 'view';

function App() {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string>('');

    useEffect(() => {
        // Check if wallet is already connected (from localStorage)
        const savedAddress = localStorage.getItem('aleo_address');
        if (savedAddress) {
            setWalletAddress(savedAddress);
            setWalletConnected(true);
        }
    }, []);

    const connectWallet = async () => {
        try {
            const address = await groupMembershipService.connectWallet();
            setWalletAddress(address);
            setWalletConnected(true);
            localStorage.setItem('aleo_address', address);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    };

    const disconnectWallet = () => {
        setWalletAddress('');
        setWalletConnected(false);
        localStorage.removeItem('aleo_address');
        setCurrentPage('home');
    };

    // Navigation Component
    const Navigation = () => (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={() => setCurrentPage('home')}
                            className="text-2xl font-bold text-blue-600"
                        >
                            🎭 Anonymous Verifier
                        </button>

                        {walletConnected && (
                            <div className="ml-10 flex items-baseline space-x-4">
                                <button
                                    onClick={() => setCurrentPage('create')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        currentPage === 'create'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Create Org
                                </button>
                                <button
                                    onClick={() => setCurrentPage('submit')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        currentPage === 'submit'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Submit Feedback
                                </button>
                                <button
                                    onClick={() => setCurrentPage('view')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        currentPage === 'view'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    View Feedback
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center">
                        {walletConnected ? (
                            <div className="flex items-center gap-4">
                                <div className="text-sm">
                                    <span className="text-gray-600">Connected:</span>{' '}
                                    <span className="font-mono text-blue-600">
                                        {walletAddress.substring(0, 12)}...
                                    </span>
                                </div>
                                <button
                                    onClick={disconnectWallet}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );

    // Home/Landing Page
    const HomePage = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="text-8xl mb-6">🎭</div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Anonymous Group Verifier
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Prove you belong without revealing who you are
                    </p>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
                        Uses zero-knowledge proofs on Aleo to verify group membership
                        while maintaining complete anonymity. Perfect for employee feedback,
                        whistleblowing, and anonymous surveys.
                    </p>

                    {!walletConnected && (
                        <button
                            onClick={connectWallet}
                            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold shadow-lg"
                        >
                            Connect Wallet to Start
                        </button>
                    )}
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-4xl mb-4">🔒</div>
                        <h3 className="text-xl font-semibold mb-3">
                            Zero-Knowledge Proofs
                        </h3>
                        <p className="text-gray-600">
                            Prove membership without revealing identity using Merkle trees
                            and ZK circuits on Aleo
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-xl font-semibold mb-3">
                            Verifiable Authenticity
                        </h3>
                        <p className="text-gray-600">
                            All feedback is cryptographically verified to come from real
                            members, preventing fake submissions
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-4xl mb-4">🚫</div>
                        <h3 className="text-xl font-semibold mb-3">
                            Untraceable
                        </h3>
                        <p className="text-gray-600">
                            Cryptographically impossible to trace feedback back to
                            individual members
                        </p>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                                <h3 className="font-semibold">Create Organization</h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-13">
                                Admin adds member addresses and generates Merkle tree.
                                Only the root is stored on-chain.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <h3 className="font-semibold">Generate Proof</h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-13">
                                Members receive credentials and can generate ZK proofs
                                of membership without revealing identity.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <h3 className="font-semibold">Submit Anonymously</h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-13">
                                Feedback is submitted with ZK proof. On-chain verification
                                confirms membership without revealing who.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why Aleo */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4 text-center">
                        Why Aleo?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">
                                ✅ Native ZK Support
                            </h3>
                            <p className="text-blue-100 text-sm">
                                Aleo has built-in zero-knowledge proof generation and
                                verification, making this trivial to implement.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">
                                ✅ Private Records
                            </h3>
                            <p className="text-blue-100 text-sm">
                                Membership credentials are private records that never
                                touch the public blockchain.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">
                                ✅ On-Chain Verification
                            </h3>
                            <p className="text-blue-100 text-sm">
                                Merkle root stored on-chain enables anyone to verify
                                proofs without trusting admins.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">
                                ✅ Impossible on Ethereum
                            </h3>
                            <p className="text-blue-100 text-sm">
                                Would require custom ZK circuits, trusted setup, and
                                separate verification infrastructure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render current page
    const renderPage = () => {
        if (!walletConnected && currentPage !== 'home') {
            return <HomePage />;
        }

        switch (currentPage) {
            case 'create':
                return <CreateOrganization />;
            case 'submit':
                return <SubmitFeedback />;
            case 'view':
                return <ViewFeedback />;
            default:
                return <HomePage />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            {renderPage()}
        </div>
    );
}

export default App;
