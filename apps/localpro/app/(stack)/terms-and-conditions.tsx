import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WavyBackground } from '../../components/WavyBackground';
import { Colors, Shadows, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

export default function TermsAndConditionsScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WavyBackground />
      {/* Header Actions */}
      <View style={[styles.headerActions, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
          onPress={() => router.back()}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Ionicons name="arrow-back" size={26} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={styles.lastUpdated}>
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>

            <Text style={styles.introText}>
              Welcome to LocalPro. These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the LocalPro platform, including our mobile application and website (collectively, the &quot;Service&quot;). By accessing or using our Service, you agree to be bound by these Terms.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.sectionText}>
                By creating an account, accessing, or using LocalPro, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Description of Service</Text>
              <Text style={styles.sectionText}>
                LocalPro is a platform that connects service providers with customers seeking local services. We facilitate bookings, payments, and communications between users. We do not provide the services ourselves but act as an intermediary platform.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
              <Text style={styles.sectionText}>
                To use certain features of the Service, you must register for an account. You agree to:
              </Text>
              <Text style={styles.bulletPoint}>• Provide accurate, current, and complete information</Text>
              <Text style={styles.bulletPoint}>• Maintain and update your information as necessary</Text>
              <Text style={styles.bulletPoint}>• Maintain the security of your account credentials</Text>
              <Text style={styles.bulletPoint}>• Accept responsibility for all activities under your account</Text>
              <Text style={styles.bulletPoint}>• Notify us immediately of any unauthorized use</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Service Providers</Text>
              <Text style={styles.sectionText}>
                Service providers are independent contractors, not employees or agents of LocalPro. Service providers are responsible for:
              </Text>
              <Text style={styles.bulletPoint}>• Providing accurate service descriptions and pricing</Text>
              <Text style={styles.bulletPoint}>• Maintaining necessary licenses, insurance, and qualifications</Text>
              <Text style={styles.bulletPoint}>• Delivering services as described and agreed upon</Text>
              <Text style={styles.bulletPoint}>• Complying with all applicable laws and regulations</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Customers</Text>
              <Text style={styles.sectionText}>
                Customers agree to:
              </Text>
              <Text style={styles.bulletPoint}>• Provide accurate booking information</Text>
              <Text style={styles.bulletPoint}>• Pay for services as agreed</Text>
              <Text style={styles.bulletPoint}>• Treat service providers with respect</Text>
              <Text style={styles.bulletPoint}>• Cancel bookings in accordance with cancellation policies</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Bookings and Payments</Text>
              <Text style={styles.sectionText}>
                Bookings are subject to acceptance by service providers. Payment processing is handled through our secure payment system. You agree to pay all fees associated with your use of the Service, including service fees and applicable taxes. Refunds are subject to our refund policy and the cancellation terms agreed upon at booking.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Cancellations and Refunds</Text>
              <Text style={styles.sectionText}>
                Cancellation policies vary by service provider and are displayed at the time of booking. Customers may cancel bookings according to the provider&apos;s cancellation policy. Service providers may cancel bookings with reasonable notice. Refunds will be processed according to the applicable cancellation policy.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. User Conduct</Text>
              <Text style={styles.sectionText}>
                You agree not to:
              </Text>
              <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
              <Text style={styles.bulletPoint}>• Infringe on the rights of others</Text>
              <Text style={styles.bulletPoint}>• Post false, misleading, or fraudulent information</Text>
              <Text style={styles.bulletPoint}>• Harass, abuse, or harm other users</Text>
              <Text style={styles.bulletPoint}>• Use the Service for any illegal purpose</Text>
              <Text style={styles.bulletPoint}>• Interfere with or disrupt the Service</Text>
              <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to the Service</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Reviews and Ratings</Text>
              <Text style={styles.sectionText}>
                Users may post reviews and ratings about services and service providers. Reviews must be truthful and based on actual experiences. We reserve the right to remove reviews that violate our policies or are deemed inappropriate, fraudulent, or defamatory.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Intellectual Property</Text>
              <Text style={styles.sectionText}>
                The Service, including its design, features, and content, is owned by LocalPro and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the Service without our express written permission.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Disclaimers</Text>
              <Text style={styles.sectionText}>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that the Service will be uninterrupted, secure, or error-free. We are not responsible for the quality, safety, or legality of services provided by service providers, nor for the accuracy of information posted by users.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Limitation of Liability</Text>
              <Text style={styles.sectionText}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOCALPRO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. Indemnification</Text>
              <Text style={styles.sectionText}>
                You agree to indemnify and hold LocalPro harmless from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of the Service, violation of these Terms, or infringement of any rights of another.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>14. Termination</Text>
              <Text style={styles.sectionText}>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any breach of these Terms. You may terminate your account at any time by contacting us or through the app settings.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>15. Changes to Terms</Text>
              <Text style={styles.sectionText}>
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>16. Governing Law</Text>
              <Text style={styles.sectionText}>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which LocalPro operates, without regard to its conflict of law provisions.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>17. Dispute Resolution</Text>
              <Text style={styles.sectionText}>
                Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with applicable arbitration rules, except where prohibited by law.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>18. Contact Information</Text>
              <Text style={styles.sectionText}>
                If you have any questions about these Terms, please contact us at:
              </Text>
              <Text style={styles.contactText}>Email: legal@localpro.com</Text>
              <Text style={styles.contactText}>Website: www.localpro.asia</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>19. Severability</Text>
              <Text style={styles.sectionText}>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>20. Entire Agreement</Text>
              <Text style={styles.sectionText}>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and LocalPro regarding the use of the Service and supersede all prior agreements and understandings.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.select({
      ios: Spacing.lg,
      android: Spacing.xl
    }),
    backgroundColor: 'transparent',
    ...Shadows.md,
    ...Platform.select({
      android: {
        elevation: Shadows.md.elevation,
      },
    }),
  },
  headerButton: {
    width: Platform.select({
      ios: 48,
      android: 48
    }),
    height: Platform.select({
      ios: 48,
      android: 48
    }),
    borderRadius: Platform.select({
      ios: 24,
      android: 24
    }),
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    ...Platform.select({
      android: {
        elevation: Shadows.lg.elevation,
      },
    }),
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  introText: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  bulletPoint: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginLeft: Spacing.md,
    marginTop: Spacing.xs,
  },
  contactText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
});

