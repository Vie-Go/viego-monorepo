import React from 'react';
import { Text, View } from 'react-native';

export interface DividerProps {
  /** Optional centered label, e.g. "or continue with". */
  label?: string;
}

/**
 * Horizontal rule, optionally with a centered label between two lines ("or continue with" on the
 * auth screens). Sourced from the `separator` primitive's role/behavior, restyled to the VieGo
 * `line` token (contracts/component-contracts.md).
 */
export function Divider({ label }: DividerProps) {
  if (!label) {
    return (
      <View
        accessibilityRole="none"
        className="self-stretch h-px bg-line dark:bg-line-dark"
      />
    );
  }
  return (
    <View className="flex-row items-center gap-md self-stretch">
      <View className="flex-1 h-px bg-line dark:bg-line-dark" />
      <Text className="text-[12px] font-urbanist-semibold text-sub dark:text-sub-dark">
        {label}
      </Text>
      <View className="flex-1 h-px bg-line dark:bg-line-dark" />
    </View>
  );
}
