import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function HelpSupportScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I book a service?',
      answer: 'To book a service, browse the marketplace, select a service provider, choose your preferred date and time, and confirm your booking. You\'ll receive a confirmation notification once your booking is accepted.',
    },
    {
      id: '2',
      question: 'How do I cancel a booking?',
      answer: 'Go to your Bookings tab, select the booking you want to cancel, and tap the Cancel button. Please note that cancellation policies may vary by service provider.',
    },
    {
      id: '3',
      question: 'How do I contact a service provider?',
      answer: 'You can message service providers directly through the Messages tab. Click on a conversation or start a new one to communicate with providers.',
    },
    {
      id: '4',
      question: 'How do I update my profile?',
      answer: 'Go to your Profile tab and tap "Edit Profile" to update your information, including your name, email, and profile photo.',
    },
    {
      id: '5',
      question: 'How do I change my notification settings?',
      answer: 'Go to Settings, then tap on "Notification Settings" to customize your notification preferences for push notifications and email notifications.',
    },
  ];

  const helpTopics = [
    {
      icon: 'book-outline' as const,
      title: 'Getting Started',
      description: 'Learn how to use LocalPro',
      color: colors.primary[600],
    },
    {
      icon: 'card-outline' as const,
      title: 'Payments & Billing',
      description: 'Payment methods and billing questions',
      color: colors.secondary[600],
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Safety & Security',
      description: 'How we protect your information',
      color: colors.primary[600],
    },
    {
      icon: 'people-outline' as const,
      title: 'Account Management',
      description: 'Manage your account settings',
      color: colors.secondary[600],
    },
  ];

  const contactOptions = [
    {
      icon: 'mail-outline' as const,
      title: 'Email Support',
      subtitle: 'support@localpro.com',
      action: () => Linking.openURL('mailto:support@localpro.com'),
      color: colors.primary[600],
    },
    {
      icon: 'chatbubble-outline' as const,
      title: 'Live Chat',
      subtitle: 'Available 24/7',
      action: () => {
        // TODO: Open live chat
        console.log('Open live chat');
      },
      color: colors.secondary[600],
    },
    {
      icon: 'call-outline' as const,
      title: 'Phone Support',
      subtitle: '+1 (555) 123-4567',
      action: () => Linking.openURL('tel:+15551234567'),
      color: colors.primary[600],
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Contact Support */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            {contactOptions.map((option, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={option.action}
                >
                  <View style={[styles.contactIcon, { backgroundColor: `${option.color}15` }]}>
                    <Ionicons name={option.icon} size={24} color={option.color} />
                  </View>
                  <View style={styles.contactContent}>
                    <Text style={styles.contactTitle}>{option.title}</Text>
                    <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </Card>

          {/* Help Topics */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Help Topics</Text>
            <View style={styles.topicsGrid}>
              {helpTopics.map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.topicItem}
                >
                  <View style={[styles.topicIcon, { backgroundColor: `${topic.color}15` }]}>
                    <Ionicons name={topic.icon} size={24} color={topic.color} />
                  </View>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* FAQs */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqs.map((faq, index) => (
              <React.Fragment key={faq.id}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Ionicons
                      name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.text.secondary}
                    />
                  </View>
                  {expandedFAQ === faq.id && (
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </Card>

          {/* Additional Resources */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Additional Resources</Text>
            
            <TouchableOpacity style={styles.resourceItem}>
              <View style={styles.resourceItemLeft}>
                <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.resourceText}>Terms & Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.resourceItem}>
              <View style={styles.resourceItemLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.resourceText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={() => Linking.openURL('https://localpro.com')}
            >
              <View style={styles.resourceItemLeft}>
                <Ionicons name="globe-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.resourceText}>Visit Our Website</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  topicItem: {
    width: '50%',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  topicIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  topicDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  faqItem: {
    paddingVertical: Spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginTop: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resourceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resourceText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
});