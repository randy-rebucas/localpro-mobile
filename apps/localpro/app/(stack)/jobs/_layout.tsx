import { Stack } from 'expo-router';

export default function JobsStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="my-jobs" options={{
                title: "My Jobs",
                headerShown: false,
            }} />
        </Stack>
    );
}

