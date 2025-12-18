import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Button, Card } from "@localpro/ui";
import { useAuth } from "@localpro/auth";

export default function Index() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LocalPro Super App</Text>
        <Text style={styles.subtitle}>Monorepo Structure</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Authentication Status</Text>
          <Text style={styles.cardText}>
            {isAuthenticated ? `Logged in as: ${user?.email}` : "Not logged in"}
          </Text>
          {isAuthenticated ? (
            <Button title="Logout" onPress={logout} variant="outline" />
          ) : (
            <Button 
              title="Login (Demo)" 
              onPress={() => login({ email: "demo@localpro.com", password: "demo123" })} 
            />
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Available Packages</Text>
          <Text style={styles.packageList}>
            • Authentication & User Management{'\n'}
            • Marketplace (Services & Bookings){'\n'}
            • Job Board{'\n'}
            • Referrals{'\n'}
            • Agencies{'\n'}
            • Supplies{'\n'}
            • Academy/Courses{'\n'}
            • Finance (Wallet, Transactions){'\n'}
            • Rentals{'\n'}
            • Ads{'\n'}
            • FacilityCare{'\n'}
            • Subscriptions (LocalPro Plus){'\n'}
            • Trust Verification{'\n'}
            • Communication (Chat, Notifications){'\n'}
            • Partners
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  cardText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  packageList: {
    fontSize: 14,
    color: "#666",
    lineHeight: 24,
  },
});
