import React from 'react';
import { Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { lightColors, darkColors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface IconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  /** Required for a11y — describes the action ("Show password", "Skip"). */
  accessibilityLabel: string;
  size?: number;
  /** Glyph color override; defaults to the muted `sub` token. */
  color?: string;
  disabled?: boolean;
  testID?: string;
}

/**
 * Circular tap target wrapping a `lucide-react-native` glyph (password show/hide, onboarding
 * skip). Hand-built on `Pressable`; enforces the ≥44×44 touch target (FR-017).
 */
export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  size = 20,
  color,
  disabled = false,
  testID,
}: IconButtonProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className="w-11 h-11 items-center justify-center rounded-full active:opacity-60"
    >
      <Icon size={size} color={color ?? colors.sub} />
    </Pressable>
  );
}
