import { Stack } from 'expo-router';

export default function CompanyStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="[companyId]" options={{
                title: "Company Details",
                headerShown: false,
            }} />
        </Stack>
    );
}

