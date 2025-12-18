import { SecureStorage } from '@localpro/storage';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

export type PackageType = 'marketplace' | 'job-board' | 'finance' | 'academy';

interface PackageContextType {
  activePackage: PackageType;
  setActivePackage: (pkg: PackageType) => Promise<void>;
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
      const stored = await SecureStorage.getItem(ACTIVE_PACKAGE_KEY);
      if (stored && ['marketplace', 'job-board', 'finance', 'academy'].includes(stored)) {
        setActivePackageState(stored as PackageType);
      } else {
        setActivePackageState(DEFAULT_PACKAGE);
      }
    } catch (error) {
      console.error('Error loading active package:', error);
      setActivePackageState(DEFAULT_PACKAGE);
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
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
};

