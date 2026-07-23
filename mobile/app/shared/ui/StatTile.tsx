import React from 'react';
import { Text, View } from 'react-native';
import { lightColors, darkColors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface StatTileProps {
  value: string | number;
  label: string;
  /** Optional leading icon/glyph (e.g. a flame). */
  icon?: React.ReactNode;
  testID?: string;
}

/**
 * Compact metric tile — large value over a muted label, optional icon (design identity.md Stat
 * row). Plain `View`; hand-built. Unwired this feature — first consumer: Profile & Preferences
 * (FR-014).
 */
export function StatTile({ value, label, icon, testID }: StatTileProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={`${value} ${label}`}
      className="flex-1 items-center gap-[2px] py-md rounded-[16px]"
      style={{ backgroundColor: colors.surface }}
    >
      {icon}
      <Text className="text-[22px] font-urbanist-heavy text-ink dark:text-ink-dark">{value}</Text>
      <Text style={{ color: colors.sub }} className="text-[12px] font-urbanist-semibold">
        {label}
      </Text>
    </View>
  );
}
