import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function BookingStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, title: "Bookings" }} />
            <Stack.Screen name="create" options={{ headerShown: false, title: "Create Booking" }} />
            <Stack.Screen name="[bookingId]" options={{
                title: "Booking Details",
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

