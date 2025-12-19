import { SecureStorage } from '@localpro/storage';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

export type PackageType = 
  | 'marketplace' 
  | 'job-board' 
  | 'finance' 
  | 'academy'
  | 'supplies'
  | 'rentals'
  | 'referrals'
  | 'agencies'
  | 'communication'
  | 'facility-care'
  | 'subscriptions'
  | 'trust'
  | 'partners'
  | 'ads';

interface PackageContextType {
  activePackage: PackageType;
  setActivePackage: (pkg: PackageType) => Promise<void>;
  isLoading: boolean;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

const ACTIVE_PACKAGE_KEY = 'active_package';
const DEFAULT_PACKAGE: PackageType = 'marketplace';

export const usePackageContext = () => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackageContext must be used within PackageProvider');
  }
  return context;
};

interface PackageProviderProps {
  children: ReactNode;
}

export const PackageProvider: React.FC<PackageProviderProps> = ({ children }) => {
  const [activePackage, setActivePackageState] = useState<PackageType>(DEFAULT_PACKAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivePackage();
  }, []);

  const loadActivePackage = async () => {
    try {
      setIsLoading(true);
      const stored = await SecureStorage.getItem(ACTIVE_PACKAGE_KEY);
      const validPackages = ['marketplace', 'job-board', 'finance', 'academy', 'supplies', 'rentals', 'referrals', 'agencies', 'communication', 'facility-care', 'subscriptions', 'trust', 'partners', 'ads'];
      
      if (stored && validPackages.includes(stored)) {
        // Valid package found, use it
        setActivePackageState(stored as PackageType);
      } else {
        // No package stored or invalid package - set default and persist it
        setActivePackageState(DEFAULT_PACKAGE);
        // Persist the default package to storage so it's available on next launch
        await SecureStorage.setItem(ACTIVE_PACKAGE_KEY, DEFAULT_PACKAGE);
      }
    } catch (error) {
      console.error('Error loading active package:', error);
      setActivePackageState(DEFAULT_PACKAGE);
      // Try to persist default even on error
      try {
        await SecureStorage.setItem(ACTIVE_PACKAGE_KEY, DEFAULT_PACKAGE);
      } catch (persistError) {
        console.error('Error persisting default package:', persistError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setActivePackage = async (pkg: PackageType) => {
    try {
      await SecureStorage.setItem(ACTIVE_PACKAGE_KEY, pkg);
      setActivePackageState(pkg);
    } catch (error) {
      console.error('Error setting active package:', error);
    }
  };

  const value: PackageContextType = {
    activePackage,
    setActivePackage,
    isLoading,
  };

  // Always render children - don't block app rendering for package loading
  // Package will default to 'marketplace' if loading fails
  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
};

