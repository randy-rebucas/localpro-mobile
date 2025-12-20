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
  | 'ads'
  | 'subscriptions'
  | 'trust'
  | 'partners'
  | 'search'
  | 'analytics';

interface PackageContextType {
  activePackage: PackageType | null;
  setActivePackage: (pkg: PackageType | null) => Promise<void>;
  resetActivePackage: () => Promise<void>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

const ACTIVE_PACKAGE_KEY = 'active_package';

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
  const [activePackage, setActivePackageState] = useState<PackageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivePackage();
  }, []);

  const loadActivePackage = async () => {
    try {
      const stored = await SecureStorage.getItem(ACTIVE_PACKAGE_KEY);
      const validPackages = ['marketplace', 'job-board', 'finance', 'academy', 'supplies', 'rentals', 'referrals', 'agencies', 'communication', 'facility-care', 'ads', 'subscriptions', 'trust', 'partners', 'search', 'analytics'];
      if (stored && validPackages.includes(stored)) {
        setActivePackageState(stored as PackageType);
      } else {
        setActivePackageState(null);
      }
    } catch (error) {
      console.error('Error loading active package:', error);
      setActivePackageState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setActivePackage = async (pkg: PackageType | null) => {
    try {
      if (pkg) {
        await SecureStorage.setItem(ACTIVE_PACKAGE_KEY, pkg);
      } else {
        await SecureStorage.removeItem(ACTIVE_PACKAGE_KEY);
      }
      setActivePackageState(pkg);
    } catch (error) {
      console.error('Error setting active package:', error);
    }
  };

  const resetActivePackage = async () => {
    await setActivePackage(null);
  };

  const value: PackageContextType = {
    activePackage,
    setActivePackage,
    resetActivePackage,
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
};

