import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { lightColors, darkColors } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export interface SegmentedControlProps {
  segments: string[];
  /** Index of the active segment. */
  value: number;
  onChange: (index: number) => void;
  testID?: string;
}

/**
 * Segmented control — a pill track with a highlighted active segment (design navigation.md).
 * Sourced from the `tabs` primitive, styled as a 2+-segment control (not a tabbed view). Unwired
 * this feature — first consumer: Content (Send Beat).
 */
export function SegmentedControl({ segments, value, onChange, testID }: SegmentedControlProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={{ backgroundColor: colors.surface }}
      className="flex-row p-[3px] rounded-full self-stretch"
    >
      {segments.map((seg, i) => {
        const active = i === value;
        return (
          <Pressable
            key={seg}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(i)}
            style={{ backgroundColor: active ? colors.card : 'transparent' }}
            className="flex-1 items-center justify-center h-[38px] rounded-full"
          >
            <Text
              style={{ color: active ? colors.text : colors.sub }}
              className="text-[13.5px] font-urbanist-bold"
            >
              {seg}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
