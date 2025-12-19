import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { usePackageContext, type PackageType } from '../../../contexts/PackageContext';
import { isValidTabRoute, navigateToFirstTab } from '../../../utils/navigation';
import { ALL_TABS as BASE_TABS } from '../../../utils/tabConfig';

// Tab configuration with package visibility mapping
type TabConfig = {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  packages: PackageType[]; // Which packages should show this tab
};

// Extend base tabs with UI metadata
const ALL_TABS: TabConfig[] = [
  // Marketplace & Job Board tabs
  { name: 'index', title: 'Home', icon: 'home', packages: ['marketplace', 'job-board'] },
  { name: 'search', title: 'Search', icon: 'search', packages: ['marketplace', 'job-board', 'supplies', 'rentals', 'agencies'] },
  { name: 'bookings', title: 'Bookings', icon: 'calendar', packages: ['marketplace', 'rentals', 'facility-care'] },
  { name: 'messages', title: 'Messages', icon: 'chatbubbles', packages: ['marketplace'] },
  { name: 'applications', title: 'Applications', icon: 'document-text', packages: ['job-board'] },
  { name: 'post-job', title: 'Post Job', icon: 'add-circle', packages: ['job-board'] },
  
  // Finance tabs
  { name: 'wallet', title: 'Wallet', icon: 'wallet', packages: ['finance'] },
  { name: 'transactions', title: 'Transactions', icon: 'list', packages: ['finance'] },
  { name: 'payments', title: 'Payments', icon: 'card', packages: ['finance'] },
  { name: 'analytics', title: 'Analytics', icon: 'stats-chart', packages: ['finance'] },
  
  // Academy tabs
  { name: 'courses', title: 'Courses', icon: 'library', packages: ['academy'] },
  { name: 'my-courses', title: 'My Courses', icon: 'book', packages: ['academy'] },
  { name: 'certificates', title: 'Certificates', icon: 'ribbon', packages: ['academy'] },
  { name: 'progress', title: 'Progress', icon: 'trending-up', packages: ['academy'] },
  
  // Supplies tabs
  { name: 'shop', title: 'Shop', icon: 'storefront', packages: ['supplies'] },
  { name: 'orders', title: 'Orders', icon: 'receipt', packages: ['supplies'] },
  { name: 'my-supplies', title: 'My Supplies', icon: 'cube', packages: ['supplies'] },
  
  // Rentals tabs
  { name: 'browse-rentals', title: 'Browse', icon: 'home', packages: ['rentals'] },
  { name: 'my-rentals', title: 'My Rentals', icon: 'business', packages: ['rentals'] },
  
  // Referrals tabs
  { name: 'refer', title: 'Refer', icon: 'share-social', packages: ['referrals'] },
  { name: 'stats', title: 'Stats', icon: 'stats-chart', packages: ['referrals'] },
  { name: 'rewards', title: 'Rewards', icon: 'gift', packages: ['referrals'] },
  
  // Agencies tabs
  { name: 'browse-agencies', title: 'Browse', icon: 'business', packages: ['agencies'] },
  { name: 'my-agencies', title: 'My Agencies', icon: 'briefcase', packages: ['agencies'] },
  { name: 'team', title: 'Team', icon: 'people', packages: ['agencies'] },
  
  // Communication tabs
  { name: 'messages-comm', title: 'Messages', icon: 'chatbubbles', packages: ['communication'] },
  { name: 'notifications-comm', title: 'Notifications', icon: 'notifications', packages: ['communication'] },
  { name: 'settings-comm', title: 'Settings', icon: 'settings', packages: ['communication'] },
  
  // Facility Care tabs
  { name: 'services-fc', title: 'Services', icon: 'medical', packages: ['facility-care'] },
  { name: 'contracts', title: 'Contracts', icon: 'document-text', packages: ['facility-care'] },
  { name: 'subscriptions-fc', title: 'Subscriptions', icon: 'card', packages: ['facility-care'] },
  
  // Common tabs (always visible)
  { name: 'profile', title: 'Profile', icon: 'person', packages: ['marketplace', 'job-board', 'finance', 'academy', 'supplies', 'rentals', 'referrals', 'agencies', 'communication', 'facility-care', 'subscriptions', 'trust', 'partners', 'ads'] }
].map(tab => {
  // Ensure packages match base configuration
  const baseTab = BASE_TABS.find(t => t.name === tab.name);
  return {
    ...tab,
    packages: (baseTab?.packages || tab.packages) as PackageType[],
  } as TabConfig;
});

export default function TabsLayout() {
  const { activePackage } = usePackageContext();
  const router = useRouter();

  // Get visible tabs for current package
  const visibleTabs = ALL_TABS.filter(tab => tab.packages.includes(activePackage));
  // Always fallback to profile since it's available for all packages
  // Validate that the route exists before using it
  const firstVisibleTab = visibleTabs[0]?.name || 'profile';
  const initialRouteName = isValidTabRoute(firstVisibleTab) ? firstVisibleTab : 'profile';

  // Helper to check if a tab should be visible
  const isTabVisible = (tabName: string): boolean => {
    const tab = ALL_TABS.find(t => t.name === tabName);
    return tab ? tab.packages.includes(activePackage) : false;
  };

  // Get tab configuration
  const getTabConfig = (tabName: string): TabConfig | undefined => {
    return ALL_TABS.find(t => t.name === tabName);
  };

  // Use shared utility for consistency

  return (
    <Tabs
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* Dynamically render all tabs with visibility control */}
      {ALL_TABS.map((tab) => {
        const isVisible = isTabVisible(tab.name);
        
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name as any}
            options={{
              title: tab.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={tab.icon} size={size} color={color} />
              ),
              // Hide tab from tab bar if not visible for current package
              tabBarItemStyle: isVisible ? undefined : { display: 'none' },
              // Prevent navigation to unauthorized tabs
              href: isVisible ? undefined : null,
            }}
            listeners={{
              // Prevent tab press if not visible
              tabPress: (e) => {
                if (!isVisible) {
                  e.preventDefault();
                  // Redirect to first available tab using type-safe navigation
                  navigateToFirstTab(router, activePackage);
                }
              },
            }}
          />
        );
      })}
    </Tabs>
  );
}

