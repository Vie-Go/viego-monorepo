import React from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewProps,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';

export function Button({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const { theme } = useTheme();
  const bg = variant === 'primary' ? theme.primary : 'transparent';
  const fg = variant === 'primary' ? '#FFFFFF' : theme.primary;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: bg, borderColor: theme.primary, borderWidth: variant === 'primary' ? 0 : 1 },
      ]}
    >
      <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Card({ children, style, ...rest }: ViewProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  const { theme } = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textMuted}
      style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  // Touch target ≥ 44px (accessibility non-negotiable).
  button: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
});
