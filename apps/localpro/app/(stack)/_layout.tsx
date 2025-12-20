import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen 
                name="edit-profile" 
                options={{ 
                    title: "Edit Profile",
                    headerStyle: {
                        backgroundColor: Colors.background.primary,
                    },
                    headerTintColor: Colors.text.primary,
                    headerTitleStyle: {
                        fontWeight: "700",
                    },
                }} 
            />
        </Stack>
    );
}
