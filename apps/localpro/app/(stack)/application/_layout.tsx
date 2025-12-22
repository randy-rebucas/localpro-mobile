import { Stack } from 'expo-router';

export default function ApplicationStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="[applicationId]" options={{
                title: "Application Details",
                headerShown: false,
            }} />
        </Stack>
    );
}

