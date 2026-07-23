import React from 'react';
import { Text, View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { lightColors, darkColors, palette } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface StreakBadgeProps {
  count: number;
  /** Broken streak → muted surface + grey flame (design-system.md "Streak badge"). */
  broken?: boolean;
  testID?: string;
}

const GOLD_TINT = 'rgba(242,183,47,0.16)';

/**
 * Streak pill — active: gold-tint background + `goldDeep` flame; broken: `surface` fill + muted
 * flame/text. Hand-built. Unwired this feature — first consumer: Profile & Preferences / Engagement.
 */
export function StreakBadge({ count, broken = false, testID }: StreakBadgeProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;
  const flameColor = broken ? colors.sub : palette.goldDeep;

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={`${count} day streak${broken ? ', broken' : ''}`}
      style={{ backgroundColor: broken ? colors.surface : GOLD_TINT }}
      className="flex-row items-center gap-xs px-md h-[34px] rounded-full self-start"
    >
      <Flame size={16} color={flameColor} fill={broken ? 'transparent' : flameColor} />
      <Text
        style={{ color: broken ? colors.sub : colors.text }}
        className="text-[13px] font-urbanist-heavy"
      >
        {count}
      </Text>
    </View>
  );
}
