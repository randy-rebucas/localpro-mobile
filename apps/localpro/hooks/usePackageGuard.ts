import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { usePackageContext, type PackageType } from '../contexts/PackageContext';
import { navigateToFirstTab, isValidTabRoute, getTabRoute } from '../utils/navigation';

/**
 * Hook to guard a screen based on active package
 * Redirects to the first available tab if the current package doesn't match
 * @param allowedPackages - Array of packages that can access this screen
 * @param redirectTo - Optional route to redirect to (defaults to first available tab)
 */
export function usePackageGuard(
  allowedPackages: PackageType[],
  redirectTo?: string
) {
  const { activePackage } = usePackageContext();
  const router = useRouter();

  useEffect(() => {
    if (!allowedPackages.includes(activePackage)) {
      // Redirect to the specified route or default to first available tab
      if (redirectTo) {
        // Validate redirectTo if it's a tab route
        if (redirectTo.startsWith('/(app)/(tabs)/')) {
          const tabName = redirectTo.replace('/(app)/(tabs)/', '');
          if (isValidTabRoute(tabName)) {
            router.replace(getTabRoute(tabName) as any);
          } else {
            navigateToFirstTab(router, activePackage);
          }
        } else {
          router.replace(redirectTo as any);
        }
      } else {
        // Redirect to first available tab for the current package
        navigateToFirstTab(router, activePackage);
      }
    }
  }, [activePackage, allowedPackages, redirectTo, router]);

  return {
    isAllowed: allowedPackages.includes(activePackage),
    activePackage,
  };
}

