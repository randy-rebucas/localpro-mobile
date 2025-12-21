import { Stack } from 'expo-router';

export default function StackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, title: "Providers" }} />
            <Stack.Screen name="[providerId]" options={{ headerShown: false, title: "Provider Details" }} />
        </Stack>
    );
}