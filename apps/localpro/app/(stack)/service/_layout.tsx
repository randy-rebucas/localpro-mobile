import { Stack } from 'expo-router';

export default function StackLayout() {
    return (
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false, title: "Services" }} />
          <Stack.Screen name="create" options={{ headerShown: false, title: "Create Service" }} />
          <Stack.Screen name="[serviceId]" options={{ headerShown: false, title: "Service Details" }} />
          <Stack.Screen name="[serviceId]/edit" options={{ headerShown: false, title: "Edit Service" }} />
        </Stack>
      );
}