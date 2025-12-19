import type { PackageType } from '../contexts/PackageContext';

/**
 * Tab configuration type
 */
export type TabConfig = {
  name: string;
  packages: PackageType[];
};

/**
 * Centralized tab configuration - single source of truth
 * This ensures consistency across all navigation logic
 */
export const ALL_TABS: TabConfig[] = [
  // Marketplace & Job Board tabs
  { name: 'index', packages: ['marketplace', 'job-board'] },
  { name: 'search', packages: ['marketplace', 'job-board', 'supplies', 'rentals', 'agencies'] },
  { name: 'bookings', packages: ['marketplace', 'rentals', 'facility-care'] },
  { name: 'messages', packages: ['marketplace'] },
  { name: 'applications', packages: ['job-board'] },
  { name: 'post-job', packages: ['job-board'] },
  
  // Finance tabs
  { name: 'wallet', packages: ['finance'] },
  { name: 'transactions', packages: ['finance'] },
  { name: 'payments', packages: ['finance'] },
  { name: 'analytics', packages: ['finance'] },
  
  // Academy tabs
  { name: 'courses', packages: ['academy'] },
  { name: 'my-courses', packages: ['academy'] },
  { name: 'certificates', packages: ['academy'] },
  { name: 'progress', packages: ['academy'] },
  
  // Supplies tabs
  { name: 'shop', packages: ['supplies'] },
  { name: 'orders', packages: ['supplies'] },
  { name: 'my-supplies', packages: ['supplies'] },
  
  // Rentals tabs
  { name: 'browse-rentals', packages: ['rentals'] },
  { name: 'my-rentals', packages: ['rentals'] },
  
  // Referrals tabs
  { name: 'refer', packages: ['referrals'] },
  { name: 'stats', packages: ['referrals'] },
  { name: 'rewards', packages: ['referrals'] },
  
  // Agencies tabs
  { name: 'browse-agencies', packages: ['agencies'] },
  { name: 'my-agencies', packages: ['agencies'] },
  { name: 'team', packages: ['agencies'] },
  
  // Communication tabs
  { name: 'messages-comm', packages: ['communication'] },
  { name: 'notifications-comm', packages: ['communication'] },
  { name: 'settings-comm', packages: ['communication'] },
  
  // Facility Care tabs
  { name: 'services-fc', packages: ['facility-care'] },
  { name: 'contracts', packages: ['facility-care'] },
  { name: 'subscriptions-fc', packages: ['facility-care'] },
  
  // Common tabs (always visible - fallback for all packages)
  { name: 'profile', packages: ['marketplace', 'job-board', 'finance', 'academy', 'supplies', 'rentals', 'referrals', 'agencies', 'communication', 'facility-care', 'subscriptions', 'trust', 'partners', 'ads'] },
];

/**
 * Get the first available tab route for a given package
 * Falls back to 'profile' if no tabs are found (shouldn't happen as profile is available for all)
 * 
 * @param pkg - The active package type
 * @returns The first available tab name for the package
 */
export function getFirstAvailableTab(pkg: PackageType): string {
  const tabs = ALL_TABS.filter(tab => tab.packages.includes(pkg));
  // Always fallback to profile since it's available for all packages
  return tabs[0]?.name || 'profile';
}

/**
 * Check if a tab is available for a given package
 * 
 * @param tabName - The tab name to check
 * @param pkg - The active package type
 * @returns True if the tab is available for the package
 */
export function isTabAvailableForPackage(tabName: string, pkg: PackageType): boolean {
  const tab = ALL_TABS.find(t => t.name === tabName);
  return tab ? tab.packages.includes(pkg) : false;
}

/**
 * Get all available tabs for a given package
 * 
 * @param pkg - The active package type
 * @returns Array of tab names available for the package
 */
export function getAvailableTabsForPackage(pkg: PackageType): string[] {
  return ALL_TABS
    .filter(tab => tab.packages.includes(pkg))
    .map(tab => tab.name);
}

