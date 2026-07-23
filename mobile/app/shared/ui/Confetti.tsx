import React, { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { palette } from '../theme/tokens';

const COLORS = [palette.gold, palette.primary, palette.goldDeep, '#FFFFFF'];

function Piece({ index, width }: { index: number; width: number }) {
  const y = useSharedValue(-40);
  const rot = useSharedValue(0);
  const left = (index * 37) % Math.max(width - 8, 1);
  const delay = (index % 8) * 120;

  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withTiming(760, { duration: 2600, easing: Easing.linear }), -1));
    rot.value = withDelay(delay, withRepeat(withTiming(540, { duration: 2600, easing: Easing.linear }), -1));
  }, [y, rot, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left, top: 0, width: 8, height: 12, borderRadius: 2, backgroundColor: COLORS[index % COLORS.length] },
        style,
      ]}
    />
  );
}

export interface ConfettiProps {
  pieceCount?: number;
  testID?: string;
}

/**
 * Milestone confetti (`vbFall`). Renders **nothing** under reduced motion (FR-036) — the reduced
 * end-state for a celebration is simply no confetti. Custom Reanimated; no `@rn-primitives`
 * equivalent. Unwired this feature — first consumer: Engagement (milestone).
 */
export function Confetti({ pieceCount = 24, testID }: ConfettiProps) {
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();

  if (reducedMotion) return null;

  return (
    <View
      testID={testID}
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    >
      {Array.from({ length: pieceCount }).map((_, i) => (
        <Piece key={i} index={i} width={width} />
      ))}
    </View>
  );
}
