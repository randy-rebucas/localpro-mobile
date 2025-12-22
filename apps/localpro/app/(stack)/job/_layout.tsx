import { Stack } from 'expo-router';

export default function JobStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="[jobId]" options={{
                title: "Job Details",
                headerShown: false
            }} />
            <Stack.Screen name="[jobId]/applications" options={{
                title: "Applications",
                headerShown: false,
            }} />
        </Stack>
    );
}

