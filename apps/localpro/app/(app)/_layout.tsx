import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from './components/CustomDrawerContent';
import { DrawerHeaderRight } from './components/DrawerHeaderRight';

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
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Home',
          headerTitle: 'LocalPro',
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

