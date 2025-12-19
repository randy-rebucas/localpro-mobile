import { SecureStorage } from '@localpro/storage';
import type { UserRole } from '@localpro/types';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface RoleContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => Promise<void>;
  availableRoles: UserRole[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ACTIVE_ROLE_KEY = 'active_role';
const DEFAULT_ROLE: UserRole = 'client';

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
  availableRoles?: UserRole[]; // Optional: can be passed from user data
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ 
  children, 
  availableRoles: propAvailableRoles 
}) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>(DEFAULT_ROLE);
  const [isLoading, setIsLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(propAvailableRoles || [DEFAULT_ROLE]);

  useEffect(() => {
    if (propAvailableRoles && propAvailableRoles.length > 0) {
      setAvailableRoles(propAvailableRoles);
    }
  }, [propAvailableRoles]);

  useEffect(() => {
    loadActiveRole();
  }, [availableRoles]);

  const loadActiveRole = async () => {
    try {
      const stored = await SecureStorage.getItem(ACTIVE_ROLE_KEY);
      const validRoles: UserRole[] = [
        'client', 
        'provider', 
        'admin', 
        'supplier', 
        'instructor', 
        'agency_owner', 
        'agency_admin', 
        'partner'
      ];
      
      if (stored && validRoles.includes(stored as UserRole)) {
        const storedRole = stored as UserRole;
        // Only set if the role is available to the user
        if (availableRoles.includes(storedRole)) {
          setActiveRoleState(storedRole);
        } else {
          // If stored role is not available, use first available role or default
          setActiveRoleState(availableRoles[0] || DEFAULT_ROLE);
        }
      } else {
        // Use first available role or default
        setActiveRoleState(availableRoles[0] || DEFAULT_ROLE);
      }
    } catch (error) {
      console.error('Error loading active role:', error);
      setActiveRoleState(availableRoles[0] || DEFAULT_ROLE);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveRole = async (role: UserRole) => {
    try {
      // Only allow setting roles that are available to the user
      if (availableRoles.includes(role)) {
        await SecureStorage.setItem(ACTIVE_ROLE_KEY, role);
        setActiveRoleState(role);
      } else {
        console.warn(`Role ${role} is not available for this user`);
      }
    } catch (error) {
      console.error('Error setting active role:', error);
    }
  };

  const value: RoleContextType = {
    activeRole,
    setActiveRole,
    availableRoles,
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

