import React from 'react';
import { View } from 'react-native';

export interface ProgressBarsProps {
  /** Total number of segments. */
  count: number;
  /** Zero-based index of the current step; segments 0..activeIndex are filled. */
  activeIndex: number;
  testID?: string;
}

/**
 * Segmented progress indicator (Onboarding) — thin gold-filled bars, `i <= activeIndex` filled,
 * the rest translucent-white (prototype). Sourced from the `progress` primitive's a11y value
 * semantics: `accessibilityValue={{ min:0, max:count, now:activeIndex+1 }}` (FR-016).
 */
export function ProgressBars({ count, activeIndex, testID }: ProgressBarsProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: count, now: activeIndex + 1 }}
      className="flex-row gap-sm"
    >
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 3,
            flex: 1,
            borderRadius: 2,
            backgroundColor: i <= activeIndex ? '#F2B72F' : 'rgba(255,255,255,0.35)',
          }}
        />
      ))}
    </View>
  );
}
