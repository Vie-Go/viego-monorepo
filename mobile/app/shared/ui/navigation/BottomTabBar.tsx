import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Camera, LucideIcon } from 'lucide-react-native';
import { lightColors, darkColors, palette } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface BottomTabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** Raised crimson camera FAB (design-system.md "Bottom tab bar"). */
  onCameraPress?: () => void;
  testID?: string;
}

/**
 * Floating blurred pill tab bar with a raised crimson camera FAB (design-system.md /
 * navigation.md). `expo-blur` backdrop. Hand-built. Unwired this feature — first consumer:
 * whichever feature ships the first real tab.
 */
export function BottomTabBar({ tabs, activeKey, onSelect, onCameraPress, testID }: BottomTabBarProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;

  return (
    <View testID={testID} accessibilityRole="tablist" className="flex-row items-center">
      <BlurView
        intensity={40}
        tint={themeName === 'dark' ? 'dark' : 'light'}
        style={{ borderRadius: 9999, overflow: 'hidden', flex: 1 }}
      >
        <View
          style={{ backgroundColor: colors.navBg }}
          className="flex-row items-center justify-around h-[62px] px-md rounded-full"
        >
          {tabs.map((tab) => {
            const active = tab.key === activeKey;
            const Icon = tab.icon;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={tab.label}
                onPress={() => onSelect(tab.key)}
                className="items-center gap-[2px] px-sm"
              >
                <Icon size={22} color={active ? palette.primary : colors.sub} />
                <Text
                  style={{ color: active ? palette.primary : colors.sub }}
                  className="text-[10px] font-urbanist-bold"
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open camera"
        onPress={onCameraPress}
        style={{ backgroundColor: palette.primary, marginLeft: 10 }}
        className="w-[54px] h-[54px] rounded-full items-center justify-center active:scale-[0.97]"
      >
        <Camera size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
