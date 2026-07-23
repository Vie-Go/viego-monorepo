import React from 'react';
import { Pressable, Text } from 'react-native';
import { lightColors, darkColors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

/**
 * Selectable pill (height 34, pill radius). Selected = `pill` fill + `pillText`; else `surface`
 * fill + `sub` text + `line` border (design-system.md "Chips"). Sourced from the
 * `toggle`/`toggle-group` primitive's role/behavior. Unwired this feature — first consumer:
 * Exploration Discover filters.
 */
export function Chip({ label, selected, onPress, testID }: ChipProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        height: 34,
        paddingHorizontal: 14,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? colors.pill : colors.surface,
        borderWidth: selected ? 0 : 1,
        borderColor: colors.line,
      }}
    >
      <Text
        style={{ color: selected ? colors.pillText : colors.sub }}
        className="text-[13px] font-urbanist-bold"
      >
        {label}
      </Text>
    </Pressable>
  );
}
