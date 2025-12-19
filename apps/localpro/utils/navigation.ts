import { useRouter } from 'expo-router';
import type { PackageType } from '../contexts/PackageContext';
import { getFirstAvailableTab } from './tabConfig';

/**
 * Valid tab route names - ensures type safety for navigation
 * This list must match the actual tab files in app/(app)/(tabs)/
 */
export type TabRouteName =
  | 'index'
  | 'search'
  | 'bookings'
  | 'messages'
  | 'applications'
  | 'post-job'
  | 'wallet'
  | 'transactions'
  | 'payments'
  | 'analytics'
  | 'courses'
  | 'my-courses'
  | 'certificates'
  | 'progress'
  | 'shop'
  | 'orders'
  | 'my-supplies'
  | 'browse-rentals'
  | 'my-rentals'
  | 'refer'
  | 'stats'
  | 'rewards'
  | 'browse-agencies'
  | 'my-agencies'
  | 'team'
  | 'messages-comm'
  | 'notifications-comm'
  | 'settings-comm'
  | 'services-fc'
  | 'contracts'
  | 'subscriptions-fc'
  | 'profile';

/**
 * Type-safe tab route path
 */
export type TabRoutePath = `/(app)/(tabs)/${TabRouteName}`;

/**
 * Validates that a tab name is a valid route
 * @param tabName - The tab name to validate
 * @returns True if the tab name is valid
 */
export function isValidTabRoute(tabName: string): tabName is TabRouteName {
  const validRoutes: TabRouteName[] = [
    'index',
    'search',
    'bookings',
    'messages',
    'applications',
    'post-job',
    'wallet',
    'transactions',
    'payments',
    'analytics',
    'courses',
    'my-courses',
    'certificates',
    'progress',
    'shop',
    'orders',
    'my-supplies',
    'browse-rentals',
    'my-rentals',
    'refer',
    'stats',
    'rewards',
    'browse-agencies',
    'my-agencies',
    'team',
    'messages-comm',
    'notifications-comm',
    'settings-comm',
    'services-fc',
    'contracts',
    'subscriptions-fc',
    'profile',
  ];
  return validRoutes.includes(tabName as TabRouteName);
}

/**
 * Get a type-safe tab route path
 * @param tabName - The tab name
 * @returns A type-safe route path
 */
export function getTabRoute(tabName: TabRouteName): TabRoutePath {
  return `/(app)/(tabs)/${tabName}`;
}

/**
 * Navigate to the first available tab for a package
 * This is type-safe and ensures the route exists
 * @param router - The Expo Router instance
 * @param activePackage - The active package type
 */
export function navigateToFirstTab(
  router: ReturnType<typeof useRouter>,
  activePackage: PackageType
): void {
  const firstTab = getFirstAvailableTab(activePackage);
  
  // Validate the tab route before navigation
  if (isValidTabRoute(firstTab)) {
    const route = getTabRoute(firstTab);
    try {
      // Expo Router requires type assertion for dynamic routes, but we validate at runtime
      router.replace(route);
    } catch (error) {
      console.error(`Navigation error for route ${route}:`, error);
      // Fallback to profile on error - ensure it's always valid
      try {
        router.replace(getTabRoute('profile'));
      } catch (fallbackError) {
        console.error('Even profile route failed:', fallbackError);
      }
    }
  } else {
    // Fallback to profile if somehow we get an invalid route
    console.warn(`Invalid tab route: ${firstTab}, falling back to profile`);
    try {
      router.replace(getTabRoute('profile'));
    } catch (error) {
      console.error('Profile route navigation failed:', error);
    }
  }
}

/**
 * Navigate to a specific tab route
 * @param router - The Expo Router instance
 * @param tabName - The tab name to navigate to
 */
export function navigateToTab(
  router: ReturnType<typeof useRouter>,
  tabName: TabRouteName
): void {
  // Validate the route before navigation
  if (isValidTabRoute(tabName)) {
    const route = getTabRoute(tabName);
    try {
      router.replace(route);
    } catch (error) {
      console.error(`Navigation error for route ${route}:`, error);
      // Fallback to profile on error
      try {
        router.replace(getTabRoute('profile'));
      } catch (fallbackError) {
        console.error('Profile route navigation failed:', fallbackError);
      }
    }
  } else {
    console.error(`Invalid tab route: ${tabName}`);
  }
}

/**
 * Navigate to a specific tab route using push (for drawer navigation)
 * @param router - The Expo Router instance
 * @param tabName - The tab name to navigate to
 */
export function pushToTab(
  router: ReturnType<typeof useRouter>,
  tabName: TabRouteName
): void {
  // Validate the route before navigation
  if (isValidTabRoute(tabName)) {
    const route = getTabRoute(tabName);
    try {
      router.push(route);
    } catch (error) {
      console.error(`Navigation error for route ${route}:`, error);
      // Fallback to profile on error
      try {
        router.push(getTabRoute('profile'));
      } catch (fallbackError) {
        console.error('Profile route navigation failed:', fallbackError);
      }
    }
  } else {
    console.error(`Invalid tab route: ${tabName}`);
  }
}

