import React, { useEffect } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';
import { lightColors, darkColors } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  testID?: string;
}

const CLOSE_THRESHOLD = 120;

/**
 * Gesture-driven bottom sheet (`vbSlideUp`) — drag down past the threshold or tap the backdrop to
 * dismiss. Reanimated + Gesture Handler; no `@rn-primitives` bottom-sheet equivalent exists
 * (research.md R1). Slide is gated on reduced motion (instant when enabled). Unwired this feature —
 * first consumer: Exploration (Province Sheet).
 */
export function BottomSheet({ visible, onClose, title, children, testID }: BottomSheetProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;
  const { height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(height);

  useEffect(() => {
    const to = visible ? 0 : height;
    translateY.value = reducedMotion ? to : withTiming(to, { duration: 260 });
  }, [visible, height, reducedMotion, translateY]);

  const pan = Gesture.Pan()
    .onChange((e) => {
      translateY.value = Math.max(0, translateY.value + e.changeY);
    })
    .onEnd(() => {
      if (translateY.value > CLOSE_THRESHOLD) {
        translateY.value = reducedMotion ? height : withTiming(height, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = reducedMotion ? 0 : withTiming(0, { duration: 200 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  if (!visible) return null;

  return (
    <View testID={testID} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      <Pressable
        accessibilityLabel="Close"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(13,9,9,0.55)' }}
      />
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 10,
              paddingHorizontal: 20,
              paddingBottom: 32,
            },
            sheetStyle,
          ]}
        >
          <View
            style={{ backgroundColor: colors.line }}
            className="w-[40px] h-[5px] rounded-full self-center mb-md"
          />
          {title ? (
            <Text
              accessibilityRole="header"
              className="text-title font-urbanist-heavy text-ink dark:text-ink-dark mb-sm"
            >
              {title}
            </Text>
          ) : null}
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
