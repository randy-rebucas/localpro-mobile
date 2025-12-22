import { Stack } from 'expo-router';

export default function FavoritesStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                title: "Favorites",
                headerShown: false,
            }} />
        </Stack>
    );
}

