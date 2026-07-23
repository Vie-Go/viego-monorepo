import React from 'react';
import { Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { lightColors, darkColors } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export interface BackButtonProps {
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Circular back affordance (`ArrowLeft`). Enforces the ≥44×44 touch target (FR-017). Hand-built.
 * Unwired this feature — first consumer: Exploration.
 */
export function BackButton({ onPress, accessibilityLabel = 'Go back', testID }: BackButtonProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{ backgroundColor: colors.surface }}
      className="w-11 h-11 rounded-full items-center justify-center active:opacity-70"
    >
      <ArrowLeft size={20} color={colors.text} />
    </Pressable>
  );
}
