import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { lightColors, darkColors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface ListRowProps {
  label: string;
  sublabel?: string;
  /** Leading element (icon/avatar). */
  leading?: React.ReactNode;
  /** Trailing value text shown before the chevron. */
  value?: string;
  /** Custom trailing element (e.g. a Toggle) — replaces value/chevron. */
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  testID?: string;
}

/**
 * Settings/list row — leading slot, label + optional sublabel, trailing value/chevron or a custom
 * control (design identity.md Settings list). Hand-built on `Pressable`. Unwired this feature —
 * first consumer: Profile & Preferences, Exploration (FR-014).
 */
export function ListRow({
  label,
  sublabel,
  leading,
  value,
  trailing,
  showChevron = true,
  onPress,
  testID,
}: ListRowProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
      onPress={onPress}
      className="flex-row items-center gap-md min-h-[56px] px-md"
    >
      {leading}
      <View className="flex-1 gap-[1px]">
        <Text className="text-[15px] font-urbanist-bold text-ink dark:text-ink-dark">{label}</Text>
        {sublabel ? (
          <Text style={{ color: colors.sub }} className="text-[12.5px] font-urbanist-medium">
            {sublabel}
          </Text>
        ) : null}
      </View>
      {trailing ?? (
        <View className="flex-row items-center gap-xs">
          {value ? (
            <Text style={{ color: colors.sub }} className="text-[13px] font-urbanist-semibold">
              {value}
            </Text>
          ) : null}
          {showChevron ? <ChevronRight size={18} color={colors.sub} /> : null}
        </View>
      )}
    </Pressable>
  );
}

export interface SpotRowProps {
  title: string;
  subtitle?: string;
  thumbnailUri?: string;
  onPress?: () => void;
  testID?: string;
}

/**
 * `SpotRow` variant — a place/POI row with a square thumbnail (design identity.md / exploration).
 */
export function SpotRow({ title, subtitle, thumbnailUri, onPress, testID }: SpotRowProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <ListRow
      testID={testID}
      label={title}
      sublabel={subtitle}
      onPress={onPress}
      leading={
        <View
          style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface, overflow: 'hidden' }}
        >
          {thumbnailUri ? (
            <Image source={{ uri: thumbnailUri }} style={{ width: '100%', height: '100%' }} />
          ) : null}
        </View>
      }
    />
  );
}
