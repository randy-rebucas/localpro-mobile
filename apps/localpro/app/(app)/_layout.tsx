import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '../../components/CustomDrawerContent';
import { DrawerHeaderRight } from '../../components/DrawerHeaderRight';

export default function AppLayout() {
  return (
    <Drawer
      initialRouteName="(tabs)"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#007AFF',
        drawerInactiveTintColor: '#666',
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerTitleAlign: 'left',
        headerRight: () => <DrawerHeaderRight />,
        drawerItemStyle: {
          display: 'none', // Hide default drawer items since we're using custom content
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Home',
          headerTitle: 'LocalPro',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="search"
        options={{
          title: 'Search',
          headerTitle: 'Search',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="bookings"
        options={{
          title: 'My Bookings',
          headerTitle: 'My Bookings',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          headerTitle: 'Favorites',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="messages"
        options={{
          title: 'Messages',
          headerTitle: 'Messages',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerTitle: 'Notifications',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="finance"
        options={{
          title: 'Finance',
          headerTitle: 'Finance',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="academy"
        options={{
          title: 'Academy',
          headerTitle: 'Academy',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="help-support"
        options={{
          title: 'Help & Support',
          headerTitle: 'Help & Support',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          title: 'About',
          headerTitle: 'About',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}

