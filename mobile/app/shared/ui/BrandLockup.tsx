import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  useReducedMotion,
} from 'react-native-reanimated';

export interface BrandLockupProps {
  /** Wordmark size; the gold dot scales with it (prototype: 30/11, 26/10, 24/9). */
  size?: number;
  /** Force white text over photography (Onboarding). */
  onDark?: boolean;
  testID?: string;
}

/**
 * The `viego` wordmark + pulsing gold dot lockup (prototype). The beat-pulse (`vbBeat`, scale
 * 1↔1.35, 1.6s loop) is gated on `useReducedMotion()` — static dot when reduced motion is on
 * (FR-036).
 */
export function BrandLockup({ size = 30, onDark = false, testID }: BrandLockupProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const dot = Math.round(size * 0.37);

  useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(withTiming(1.35, { duration: 800 }), -1, true);
    return () => cancelAnimation(scale);
  }, [reducedMotion, scale]);

  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View
      testID={testID}
      accessibilityRole="header"
      accessibilityLabel="VieGo"
      className="flex-row items-center gap-[7px]"
    >
      <Text
        style={{ fontSize: size, letterSpacing: -0.5 }}
        className={onDark ? 'font-urbanist-heavy text-white' : 'font-urbanist-heavy text-ink dark:text-ink-dark'}
      >
        viego
      </Text>
      <Animated.View
        style={[
          {
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: '#F2B72F',
            marginTop: Math.round(size * 0.27),
          },
          dotStyle,
        ]}
      />
    </View>
  );
}
