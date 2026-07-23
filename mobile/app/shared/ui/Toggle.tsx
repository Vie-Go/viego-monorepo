import React from 'react';
import { Pressable, View } from 'react-native';
import { lightColors, darkColors, palette } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface ToggleProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  accessibilityLabel: string;
  testID?: string;
}

/**
 * On/off switch — track turns `primary` crimson when on (design identity.md dark-mode switch).
 * Sourced from the `switch` primitive's role/behavior: `accessibilityRole="switch"` with
 * `accessibilityState={{ checked }}`. Unwired this feature — first consumer: Profile & Preferences
 * (FR-013).
 */
export function Toggle({ value, onValueChange, disabled = false, accessibilityLabel, testID }: ToggleProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={{
        width: 52,
        height: 32,
        borderRadius: 16,
        padding: 3,
        justifyContent: 'center',
        backgroundColor: value ? palette.primary : colors.line,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: '#FFFFFF',
          alignSelf: value ? 'flex-end' : 'flex-start',
        }}
      />
    </Pressable>
  );
}
