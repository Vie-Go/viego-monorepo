import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { lightColors, darkColors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { FlagIcon } from './FlagIcon';

export interface SelectRowProps {
  /** Two-letter chip / locale code (e.g., 'VI', 'EN', 'KO', 'JA', 'FR'). */
  code: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

const SELECTED_FILL = 'rgba(190,56,42,0.06)'; // 6% crimson (prototype)

/**
 * A selectable list row with a leading country flag chip, label + native subtitle, and a trailing radio
 * dot (Language Select). Selected: crimson border, 6%-crimson fill, filled crimson dot.
 * Sourced from the `radio-group` primitive's role/behavior — `accessibilityRole="radio"` with
 * `accessibilityState={{ selected }}` (contracts/component-contracts.md; design identity.md).
 */
export function SelectRow({ code, label, sublabel, selected, onPress, testID }: SelectRowProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: selected ? '#BE382A' : colors.line,
        backgroundColor: selected ? SELECTED_FILL : 'transparent',
      }}
    >
      <FlagIcon code={code} size={38} />
      <View className="flex-1 gap-[1px]">
        <View className="flex-row items-center gap-xs">
          <Text className="text-[15px] font-urbanist-bold text-ink dark:text-ink-dark">
            {label}
          </Text>
          <Text
            style={{ opacity: 0, width: 0, height: 0 }}
            className="text-[0px]"
          >
            {code}
          </Text>
        </View>
        {sublabel ? (
          <Text style={{ color: colors.sub }} className="text-[12px] font-urbanist-medium">
            {sublabel}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: selected ? '#BE382A' : colors.line,
          backgroundColor: selected ? '#BE382A' : 'transparent',
        }}
      />
    </Pressable>
  );
}
