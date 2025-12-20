import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function StackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, title: "Providers" }} />
            <Stack.Screen name="[providerId]" options={{
                title: "Provider Details",
                headerStyle: {
                    backgroundColor: Colors.background.primary,
                },
                headerTintColor: Colors.text.primary,
                headerTitleStyle: {
                    fontWeight: "700",
                },
            }} />
        </Stack>
    );
}