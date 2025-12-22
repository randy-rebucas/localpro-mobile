import { Stack } from 'expo-router';

export default function NotificationsStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                title: "Notifications",
                headerShown: false,
            }} />
        </Stack>
    );
}

