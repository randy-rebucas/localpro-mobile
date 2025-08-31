import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from "expo-router";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import { LoginScreen } from "../components/LoginScreen";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const { width, height } = Dimensions.get('window');

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.loadingContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="construct" size={60} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.loadingTitle}>LocalPro</Text>
          <Text style={styles.loadingSubtitle}>Connecting you with local professionals</Text>
          <ActivityIndicator size="large" color="#fff" style={styles.loadingSpinner} />
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#f8f9fa',
        },
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false 
        }} 
      />
              <Stack.Screen 
          name="post-a-job" 
          options={{ 
            title: "Create Booking",
            headerShown: true,
            presentation: 'modal',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#667eea',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 20,
              color: '#333',
            },
            headerShadowVisible: false,
          }} 
        />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  loadingSpinner: {
    marginTop: 20,
  },
});
