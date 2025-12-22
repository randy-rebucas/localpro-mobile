import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface Step {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: ReactNode;
  showProgress?: boolean;
}

export function MultiStepForm({ steps, currentStep, onStepChange, children, showProgress = true }: MultiStepFormProps) {
  const colors = useThemeColors();

  const canGoNext = currentStep < steps.length - 1;
  const canGoBack = currentStep > 0;

  const handleNext = () => {
    if (canGoNext) {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <View style={styles.container}>
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                  backgroundColor: colors.primary[600],
                },
              ]}
            />
          </View>
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <View key={step.id} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor: isCompleted
                          ? colors.primary[600]
                          : isActive
                          ? colors.primary[600]
                          : colors.background.secondary,
                        borderColor: isActive || isCompleted ? colors.primary[600] : colors.border.light,
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={20} color={Colors.text.inverse} />
                    ) : (
                      <Ionicons
                        name={step.icon}
                        size={20}
                        color={isActive ? Colors.text.inverse : colors.text.secondary}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepTitle,
                      {
                        color: isActive || isCompleted ? colors.text.primary : colors.text.tertiary,
                        fontWeight: isActive ? Typography.fontWeight.semibold : Typography.fontWeight.regular,
                      },
                    ]}
                  >
                    {step.title}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.content}>{children}</View>

      <View style={[styles.navigation, { borderTopColor: colors.border.light }]}>
        {canGoBack && (
          <TouchableOpacity
            style={[styles.navButton, styles.backButton, { borderColor: colors.border.light }]}
            onPress={handleBack}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.secondary} />
            <Text style={[styles.navButtonText, { color: colors.text.secondary }]}>Back</Text>
          </TouchableOpacity>
        )}
        {canGoNext && (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, { backgroundColor: colors.primary[600] }]}
            onPress={handleNext}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Text style={[styles.navButtonText, { color: Colors.text.inverse }]}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.background.secondary,
    borderRadius: 2,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  content: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
    gap: Spacing.md,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Platform.select({ ios: 12, android: 14 }),
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 100,
  },
  backButton: {
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    backgroundColor: Colors.background.primary,
  },
  nextButton: {
    flex: 1,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

