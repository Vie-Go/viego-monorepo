import React from 'react';
import { Text, View } from 'react-native';
import { BackButton } from './BackButton';

export interface ScreenHeaderProps {
  title?: string;
  /** Show the back button (default true). */
  showBack?: boolean;
  onBack?: () => void;
  /** Right-aligned actions (icon buttons). */
  right?: React.ReactNode;
  testID?: string;
}

/**
 * Screen header — optional back button, centered title, right action slot (design navigation.md).
 * Hand-built. Unwired this feature — first consumer: Exploration (Search, Notifications).
 */
export function ScreenHeader({ title, showBack = true, onBack, right, testID }: ScreenHeaderProps) {
  return (
    <View testID={testID} className="flex-row items-center min-h-[48px] px-md gap-md">
      <View className="w-11">{showBack ? <BackButton onPress={onBack} /> : null}</View>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        className="flex-1 text-title font-urbanist-heavy text-ink dark:text-ink-dark text-center"
      >
        {title ?? ''}
      </Text>
      <View className="w-11 items-end">{right}</View>
    </View>
  );
}
