import { Ionicons } from '@expo/vector-icons';
import { Button } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import { useThemeColors } from '../hooks/use-theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={colors.semantic.error} />
        </View>
        
        <Text style={styles.title}>Something went wrong</Text>
        
        <Text style={styles.message}>
          We're sorry, but something unexpected happened. Please try again or go back.
        </Text>

        {__DEV__ && error && (
          <View style={[styles.errorDetails, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.errorTitle, { color: colors.semantic.error }]}>
              Error Details (Development Only)
            </Text>
            <Text style={[styles.errorText, { color: colors.text.secondary }]}>
              {error.toString()}
            </Text>
            {error.stack && (
              <Text style={[styles.errorStack, { color: colors.text.tertiary }]}>
                {error.stack}
              </Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <View style={styles.button}>
            <Button
              title="Go Back"
              onPress={() => router.back()}
              variant="primary"
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Try Again"
              onPress={onReset}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
  errorDetails: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    marginBottom: Spacing.xs,
  },
  errorStack: {
    fontSize: 10,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    maxWidth: 400,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
});

