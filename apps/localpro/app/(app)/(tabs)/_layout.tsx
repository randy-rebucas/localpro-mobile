import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Colors } from '../../../constants/theme';
import { usePackageContext, type PackageType } from '../../../contexts/PackageContext';

// Tab configuration with package visibility mapping
type TabConfig = {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  packages: PackageType[]; // Which packages should show this tab
};

const ALL_TABS: TabConfig[] = [
  // Drawer tabs
  { name: 'favorites', title: 'Favorites', icon: 'star', packages: [] },
  { name: 'notifications', title: 'Notifications', icon: 'notifications', packages: [] },
  { name: 'settings', title: 'Settings', icon: 'settings', packages: [] },
  { name: 'help-support', title: 'Help & Support', icon: 'help-circle', packages: [] },
  { name: 'about', title: 'About', icon: 'information-circle', packages: [] },

  // Marketplace & Job Board tabs
  { name: 'index', title: 'Home', icon: 'home', packages: ['marketplace', 'job-board'] },
  { name: 'search', title: 'Search', icon: 'search', packages: ['marketplace', 'job-board', 'supplies', 'rentals', 'agencies'] },
  { name: 'bookings', title: 'Bookings', icon: 'calendar', packages: ['marketplace', 'rentals', 'facility-care'] },
  { name: 'messages', title: 'Messages', icon: 'chatbubbles', packages: ['marketplace'] },
  
  // Job Board tabs
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
  { name: 'leaderboard', title: 'Leaderboard', icon: 'trophy', packages: ['referrals'] },
  
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
  
  // Ads tabs
  { name: 'browse-ads', title: 'Browse', icon: 'megaphone', packages: ['ads'] },
  { name: 'my-ads', title: 'My Ads', icon: 'list', packages: ['ads'] },
  { name: 'ads-search', title: 'Search', icon: 'search', packages: ['ads'] },
  { name: 'ads-analytics', title: 'Analytics', icon: 'stats-chart', packages: ['ads'] },
  
  // Subscriptions tabs
  { name: 'browse-subscriptions', title: 'Plans', icon: 'card', packages: ['subscriptions'] },
  { name: 'my-subscriptions', title: 'My Subscriptions', icon: 'receipt', packages: ['subscriptions'] },
  { name: 'billing', title: 'Billing', icon: 'card-outline', packages: ['subscriptions'] },
  
  // Trust Verification tabs
  { name: 'verify', title: 'Verify', icon: 'shield-checkmark', packages: ['trust'] },
  { name: 'verification-status', title: 'Status', icon: 'checkmark-circle', packages: ['trust'] },
  { name: 'documents', title: 'Documents', icon: 'document-text', packages: ['trust'] },
  { name: 'verified', title: 'Verified', icon: 'checkmark-done', packages: ['trust'] },
  
  // Partners tabs
  { name: 'browse-partners', title: 'Browse', icon: 'people', packages: ['partners'] },
  { name: 'my-partners', title: 'My Partners', icon: 'people-circle', packages: ['partners'] },
  { name: 'onboarding', title: 'Onboarding', icon: 'person-add', packages: ['partners'] },
  { name: 'usage', title: 'Usage', icon: 'analytics', packages: ['partners'] },
  
  // Search package tabs
  { name: 'global-search', title: 'Global', icon: 'search', packages: ['search'] },
  { name: 'popular', title: 'Popular', icon: 'trending-up', packages: ['search'] },
  { name: 'locations', title: 'Locations', icon: 'location', packages: ['search'] },
  { name: 'categories', title: 'Categories', icon: 'grid', packages: ['search'] },
  
  // Analytics package tabs
  { name: 'dashboard', title: 'Dashboard', icon: 'stats-chart', packages: ['analytics'] },
  { name: 'trends', title: 'Trends', icon: 'trending-up', packages: ['analytics'] },
  { name: 'financial-analytics', title: 'Financial', icon: 'cash', packages: ['analytics'] },
  { name: 'user-analytics', title: 'Users', icon: 'people', packages: ['analytics'] },
  
  // Common tabs (always visible)
  { name: 'profile', title: 'Profile', icon: 'person', packages: ['marketplace', 'job-board', 'finance', 'academy', 'supplies', 'rentals', 'referrals', 'agencies', 'communication', 'facility-care', 'ads', 'subscriptions', 'trust', 'partners', 'search', 'analytics'] }
];

export default function TabsLayout() {
  const { activePackage } = usePackageContext();

  // Get visible tabs for current package
  const visibleTabs = activePackage 
    ? ALL_TABS.filter(tab => tab.packages.includes(activePackage))
    : [];
  const initialRouteName = visibleTabs[0]?.name || 'index';

  // Helper to check if a tab should be visible
  const isTabVisible = (tabName: string): boolean => {
    if (!activePackage) return false;
    const tab = ALL_TABS.find(t => t.name === tabName);
    return tab ? tab.packages.includes(activePackage) : false;
  };

  return (
    <Tabs
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border.light,
          backgroundColor: Colors.background.primary,
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
              // Also use href: null for better compatibility
              href: isVisible ? undefined : null,
            }}
          />
        );
      })}
    </Tabs>
  );
}

