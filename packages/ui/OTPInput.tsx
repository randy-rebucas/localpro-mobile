import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 6, 
  onComplete, 
  error 
}) => {
  const [codes, setCodes] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // Handle paste
      const digits = digit.slice(0, length).split('');
      const newCodes = [...codes];
      digits.forEach((d, i) => {
        if (index + i < length) {
          newCodes[index + i] = d;
        }
      });
      setCodes(newCodes);
      
      // Focus last filled input
      const lastIndex = Math.min(index + digits.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();
      
      // Check if complete
      if (newCodes.every(c => c !== '')) {
        onComplete(newCodes.join(''));
      }
      return;
    }

    const newCodes = [...codes];
    newCodes[index] = digit;
    setCodes(newCodes);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newCodes.every(c => c !== '')) {
      onComplete(newCodes.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {codes.map((code, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.input,
              code ? styles.inputFilled : null,
              error ? styles.inputError : null,
            ]}
            value={code}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

// Theme colors
const themeColors = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  error: '#DC2626',
  gray200: '#E5E7EB',
  gray900: '#1F2937',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 64,
    borderWidth: 2,
    borderColor: themeColors.gray200,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    backgroundColor: themeColors.white,
    color: themeColors.gray900,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFilled: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.primaryLight,
    borderWidth: 3,
    shadowColor: themeColors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    borderColor: themeColors.error,
    backgroundColor: '#FEE2E2',
  },
  error: {
    color: themeColors.error,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

