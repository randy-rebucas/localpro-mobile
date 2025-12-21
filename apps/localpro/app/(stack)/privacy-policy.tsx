import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

export default function PrivacyPolicyScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
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
              At LocalPro, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Service"). Please read this Privacy Policy carefully. By using our Service, you consent to the data practices described in this policy.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              
              <Text style={styles.subsectionTitle}>1.1 Personal Information</Text>
              <Text style={styles.sectionText}>
                We collect information that you provide directly to us, including:
              </Text>
              <Text style={styles.bulletPoint}>• Name, email address, phone number, and postal address</Text>
              <Text style={styles.bulletPoint}>• Profile information and photos</Text>
              <Text style={styles.bulletPoint}>• Payment information (processed through secure third-party payment processors)</Text>
              <Text style={styles.bulletPoint}>• Service preferences and booking history</Text>
              <Text style={styles.bulletPoint}>• Communications with service providers and customer support</Text>

              <Text style={styles.subsectionTitle}>1.2 Automatically Collected Information</Text>
              <Text style={styles.sectionText}>
                When you use our Service, we automatically collect certain information, including:
              </Text>
              <Text style={styles.bulletPoint}>• Device information (device type, operating system, unique device identifiers)</Text>
              <Text style={styles.bulletPoint}>• Location information (with your permission)</Text>
              <Text style={styles.bulletPoint}>• Usage data (pages visited, features used, time spent)</Text>
              <Text style={styles.bulletPoint}>• Log information (IP address, access times, app crashes)</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
              <Text style={styles.sectionText}>
                We use the information we collect to:
              </Text>
              <Text style={styles.bulletPoint}>• Provide, maintain, and improve our Service</Text>
              <Text style={styles.bulletPoint}>• Process transactions and send related information</Text>
              <Text style={styles.bulletPoint}>• Send you technical notices, updates, and support messages</Text>
              <Text style={styles.bulletPoint}>• Respond to your comments, questions, and requests</Text>
              <Text style={styles.bulletPoint}>• Communicate with you about products, services, and promotional offers</Text>
              <Text style={styles.bulletPoint}>• Monitor and analyze trends, usage, and activities</Text>
              <Text style={styles.bulletPoint}>• Detect, prevent, and address technical issues and fraudulent activity</Text>
              <Text style={styles.bulletPoint}>• Personalize and improve your experience</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Information Sharing and Disclosure</Text>
              <Text style={styles.sectionText}>
                We may share your information in the following circumstances:
              </Text>

              <Text style={styles.subsectionTitle}>3.1 Service Providers</Text>
              <Text style={styles.sectionText}>
                We share information with service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, and hosting services.
              </Text>

              <Text style={styles.subsectionTitle}>3.2 With Other Users</Text>
              <Text style={styles.sectionText}>
                When you book a service or communicate with service providers, we share necessary information (such as your name, contact information, and booking details) to facilitate the transaction.
              </Text>

              <Text style={styles.subsectionTitle}>3.3 Business Transfers</Text>
              <Text style={styles.sectionText}>
                If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </Text>

              <Text style={styles.subsectionTitle}>3.4 Legal Requirements</Text>
              <Text style={styles.sectionText}>
                We may disclose your information if required to do so by law or in response to valid requests by public authorities.
              </Text>

              <Text style={styles.subsectionTitle}>3.5 With Your Consent</Text>
              <Text style={styles.sectionText}>
                We may share your information with third parties when you have given us explicit consent to do so.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Data Security</Text>
              <Text style={styles.sectionText}>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Data Retention</Text>
              <Text style={styles.sectionText}>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
              <Text style={styles.sectionText}>
                You have certain rights regarding your personal information:
              </Text>
              <Text style={styles.bulletPoint}>• Access: You can access and update your personal information through your account settings</Text>
              <Text style={styles.bulletPoint}>• Deletion: You can request deletion of your account and personal information</Text>
              <Text style={styles.bulletPoint}>• Opt-out: You can opt-out of promotional communications by following the unsubscribe instructions</Text>
              <Text style={styles.bulletPoint}>• Location: You can disable location services through your device settings</Text>
              <Text style={styles.bulletPoint}>• Cookies: You can control cookies through your browser settings</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
              <Text style={styles.sectionText}>
                Our Service is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
              <Text style={styles.sectionText}>
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party services you access.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
              <Text style={styles.sectionText}>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our Service, you consent to the transfer of your information to these countries.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. California Privacy Rights</Text>
              <Text style={styles.sectionText}>
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information (we do not sell personal information).
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. European Privacy Rights</Text>
              <Text style={styles.sectionText}>
                If you are located in the European Economic Area (EEA), you have certain rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, object to processing, and data portability. You also have the right to lodge a complaint with a supervisory authority.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Changes to This Privacy Policy</Text>
              <Text style={styles.sectionText}>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. Cookies and Tracking Technologies</Text>
              <Text style={styles.sectionText}>
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>14. Contact Us</Text>
              <Text style={styles.sectionText}>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
              </Text>
              <Text style={styles.contactText}>Email: privacy@localpro.com</Text>
              <Text style={styles.contactText}>Website: www.localpro.asia</Text>
              <Text style={styles.contactText}>Address: [Your Company Address]</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>15. Consent</Text>
              <Text style={styles.sectionText}>
                By using our Service, you consent to our Privacy Policy and agree to its terms. If you do not agree with this policy, please do not use our Service.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
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

