import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="profile/edit" options={{ headerShown: false, title: "Edit Profile" }} />
            <Stack.Screen name="settings" options={{ headerShown: false, title: "Settings" }} />
            <Stack.Screen name="help-support" options={{ headerShown: false, title: "Help & Support" }} />
            <Stack.Screen name="privacy-policy" options={{ headerShown: false, title: "Privacy Policy" }} />
            <Stack.Screen name="terms-and-conditions" options={{ headerShown: false, title: "Terms & Conditions" }} />
            <Stack.Screen name="about" options={{ headerShown: false, title: "About" }} />
            <Stack.Screen name="booking" options={{ headerShown: false, title: "Booking" }} />
            <Stack.Screen name="provider" options={{ headerShown: false, title: "Provider" }} />
            <Stack.Screen name="service" options={{ headerShown: false, title: "Service" }} />
        </Stack>
    );
}
