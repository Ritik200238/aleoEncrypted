/**
 * User Registry Integration Example
 * Demonstrates how to use the user registry service and components
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { UserSearch, UserSearchModal } from '../components/UserSearch';
import { ProfileRegistration } from '../components/ProfileRegistration';
import { userRegistryService, type UserProfile } from '../services/userRegistryService';
import { Users, Search as SearchIcon, UserPlus, Settings } from 'lucide-react';

export function UserRegistryExample() {
  const { wallet, publicKey } = useWallet();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize service with wallet
  useEffect(() => {
    if (wallet) {
      userRegistryService.setWallet(wallet);
    }
  }, [wallet]);

  // Load current user profile
  useEffect(() => {
    loadUserProfile();
  }, [publicKey]);

  const loadUserProfile = async () => {
    if (!publicKey) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const profile = await userRegistryService.getProfileByAddress(
        publicKey.toString()
      );

      if (profile) {
        setCurrentProfile(profile);
        setShowRegistration(false);
      } else {
        // No profile found, show registration
        setShowRegistration(true);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful registration
  const handleRegistrationSuccess = (profile: UserProfile) => {
    setCurrentProfile(profile);
    setShowRegistration(false);
  };

  // Handle user selection from search
  const handleUserSelect = (profile: UserProfile) => {
    console.log('Selected user:', profile);
    // You can open a chat or show profile details here
  };

  // Handle add contact
  const handleAddContact = (profile: UserProfile) => {
    console.log('Contact added:', profile);
  };

  // Initialize demo profiles (for testing)
  const initializeDemoProfiles = async () => {
    try {
      await userRegistryService.initializeDemoProfiles();
      console.log('Demo profiles initialized');
    } catch (err) {
      console.error('Failed to initialize demo profiles:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20">
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Encrypted Social</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Connect your wallet to register your profile and search for users
          </p>
          <WalletMultiButton />
          <button
            onClick={initializeDemoProfiles}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Initialize Demo Profiles
          </button>
        </div>
      </div>
    );
  }

  if (showRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
        <ProfileRegistration
          walletAddress={publicKey.toString()}
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setShowRegistration(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">User Registry Demo</h1>
            </div>
            <div className="flex items-center gap-3">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Profile */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Your Profile
              </h2>

              {currentProfile ? (
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    {currentProfile.avatar.startsWith('http') ? (
                      <img
                        src={currentProfile.avatar}
                        alt={currentProfile.name}
                        className="w-24 h-24 rounded-full object-cover mb-3"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl mb-3">
                        {currentProfile.avatar || currentProfile.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-semibold text-lg">
                      {currentProfile.name}
                    </h3>
                    <p className="text-primary text-sm">{currentProfile.handle}</p>
                  </div>

                  {/* Bio */}
                  {currentProfile.bio && (
                    <p className="text-sm text-muted-foreground text-center">
                      {currentProfile.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Registered</span>
                      <span>
                        {new Date(currentProfile.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-green-500">
                        {currentProfile.isRegistered ? 'On-chain' : 'Local'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => setShowRegistration(true)}
                    className="w-full px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>No profile loaded</p>
                </div>
              )}
            </div>
          </div>

          {/* User Search */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl overflow-hidden h-[700px]">
              <UserSearch
                onUserSelect={handleUserSelect}
                onAddContact={handleAddContact}
                showAddButton={true}
              />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<SearchIcon className="w-6 h-6" />}
            title="User Search"
            description="Search for users by @handle with debounced on-chain lookups"
          />
          <FeatureCard
            icon={<UserPlus className="w-6 h-6" />}
            title="Profile Registration"
            description="Register your profile on-chain with encrypted data"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Contact Management"
            description="Add users to your contacts and manage relationships"
          />
        </div>

        {/* Demo Actions */}
        <div className="mt-8 bg-accent/50 border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Demo Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={initializeDemoProfiles}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Initialize Demo Profiles
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Open Search Modal
            </button>
            <button
              onClick={loadUserProfile}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Reload Profile
            </button>
          </div>
        </div>
      </main>

      {/* Search Modal */}
      <UserSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onUserSelect={handleUserSelect}
        onAddContact={handleAddContact}
        showAddButton={true}
      />
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default UserRegistryExample;
