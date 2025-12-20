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
    </Drawer>
  );
}

