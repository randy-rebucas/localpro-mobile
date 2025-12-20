import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="profile/edit"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen name="settings" options={{
                headerShown: false
            }} />
            <Stack.Screen name="help-support" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ headerShown: false }} />
            <Stack.Screen name="booking" options={{ headerShown: false }} />
            <Stack.Screen name="provider" options={{ headerShown: false }} />
            <Stack.Screen name="service" options={{ headerShown: false }} />
        </Stack>
    );
}
