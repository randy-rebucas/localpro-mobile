import React from 'react';
import { TextInput, StyleSheet, Text, View } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoComplete?: string;
  autoFocus?: boolean;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  error,
  multiline = false,
  keyboardType = 'default',
  autoComplete,
  autoFocus = false,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        autoComplete={autoComplete as any}
        autoFocus={autoFocus}
        placeholderTextColor={themeColors.gray600}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

// Theme colors - matching logo brand colors
const themeColors = {
  white: '#FFFFFF',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  gray900: '#1F2937',
  primary: '#2563EB',      // Medium-dark blue from logo
  error: '#DC2626',       // Error red
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: themeColors.gray900,
  },
  input: {
    borderWidth: 1,
    borderColor: themeColors.gray200,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: themeColors.white,
    color: themeColors.gray900,
  },
  inputError: {
    borderColor: themeColors.error,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: themeColors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

