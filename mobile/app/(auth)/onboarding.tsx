import React, { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from 'react-native-reanimated';
import { BrandLockup } from '../shared/ui/BrandLockup';
import { ProgressBars } from '../shared/ui/ProgressBars';
import { Button } from '../shared/ui/Button';
import { useI18n } from '../shared/i18n/I18nProvider';
import type { TranslationKey } from '../shared/i18n/translations';
import { useSessionStore } from '../shared/store/sessionStore';

interface Slide {
  title: TranslationKey;
  sub: TranslationKey;
  cta: TranslationKey;
  /** Placeholder scenery gradient (real photos ship in assets/photos later). */
  colors: [string, string];
}

const SLIDES: Slide[] = [
  {
    title: 'identity.onboarding.slide1.title',
    sub: 'identity.onboarding.slide1.sub',
    cta: 'identity.onboarding.next',
    colors: ['#7A2E12', '#3A1408'],
  },
  {
    title: 'identity.onboarding.slide2.title',
    sub: 'identity.onboarding.slide2.sub',
    cta: 'identity.onboarding.next',
    colors: ['#1F4A5A', '#0A1E26'],
  },
  {
    title: 'identity.onboarding.slide3.title',
    sub: 'identity.onboarding.slide3.sub',
    cta: 'identity.onboarding.start',
    colors: ['#8A5A12', '#2E1C05'],
  },
];

/**
 * Onboarding (US2) — 3 full-bleed slides with a dark bottom-up gradient scrim, brand lockup, Skip
 * pill (R10 — the prototype has one), segmented progress, and a gold CTA. Swipe + tap-to-advance
 * (FR-029, FR-030). Slide transitions are gated on reduced motion (T037/FR-036): instant scroll,
 * no animated paging. Finishing the last slide or Skip completes onboarding and lands on main;
 * the routing guard ensures it's never shown again (FR-029).
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const finish = () => {
    completeOnboarding();
    router.replace('/main');
  };

  const advance = () => {
    if (page < SLIDES.length - 1) {
      const next = page + 1;
      setPage(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: !reducedMotion });
    } else {
      finish();
    }
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  const current = SLIDES[page];

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={{ width }} className="flex-1">
            <LinearGradient colors={slide.colors} style={{ flex: 1 }} />
          </View>
        ))}
      </ScrollView>

      {/* Bottom-up dark scrim (theme-independent — always a dark photo overlay). */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(10,6,7,0.35)',
          'rgba(10,6,7,0)',
          'rgba(10,6,7,0.05)',
          'rgba(10,6,7,0.78)',
          'rgba(10,6,7,0.92)',
        ]}
        locations={[0, 0.3, 0.45, 0.78, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Brand lockup — top-left, white. */}
      <View style={{ position: 'absolute', left: 26, top: 76 }}>
        <BrandLockup size={24} onDark />
      </View>

      {/* Skip pill — top-right (R10). 34px tall per the prototype; hitSlop lifts the effective
          touch target to ≥44 (FR-017). */}
      <Pressable
        testID="onboarding-skip"
        accessibilityRole="button"
        accessibilityLabel={t('identity.onboarding.skip')}
        onPress={finish}
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        style={{ position: 'absolute', right: 14, top: 68 }}
        className="h-[34px] px-[15px] rounded-[17px] bg-white/[0.16] items-center justify-center flex-row"
      >
        <Text className="text-[13px] font-urbanist-heavy text-white">
          {t('identity.onboarding.skip')}
        </Text>
      </Pressable>

      {/* Bottom content block. */}
      <View style={{ position: 'absolute', left: 26, right: 26, bottom: 36 }} className="gap-[14px]">
        <Text
          className="text-[38px] font-urbanist-heavy text-white"
          style={{ lineHeight: 41, letterSpacing: -0.6 }}
        >
          {t(current.title)}
        </Text>
        <Text
          className="text-[15px] font-urbanist-medium text-white/85"
          style={{ lineHeight: 23, maxWidth: 320 }}
        >
          {t(current.sub)}
        </Text>
        <View className="mt-sm">
          <ProgressBars testID="onboarding-progress" count={SLIDES.length} activeIndex={page} />
        </View>
        <View className="mt-xs">
          <Button testID="onboarding-cta" variant="gold" label={t(current.cta)} onPress={advance} />
        </View>
      </View>
    </View>
  );
}
