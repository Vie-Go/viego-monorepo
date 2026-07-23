import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLockup } from '../shared/ui/BrandLockup';
import { SelectRow } from '../shared/ui/SelectRow';
import { Button } from '../shared/ui/Button';
import { useI18n } from '../shared/i18n/I18nProvider';
import { LOCALE_META } from '../shared/i18n/translations';
import { useLanguageStore } from '../shared/store/languageStore';

/**
 * Language Select (US1) — first screen on a fresh install. Brand lockup, bilingual headline,
 * 5-locale radio list (one always pre-selected from the device locale, FR-018), full-width
 * Continue pill. Picking a row updates the interface text live (previewLanguage); Continue
 * confirms + persists and lets the routing guard advance to Log in (FR-016).
 */
export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const selected = useLanguageStore((s) => s.code);
  const previewLanguage = useLanguageStore((s) => s.previewLanguage);
  const confirmLanguage = useLanguageStore((s) => s.confirmLanguage);

  const onContinue = () => {
    confirmLanguage(selected ?? 'en');
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-bg dark:bg-bg-dark">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: Math.max(insets.top, 44) + 44,
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 30),
        }}
        showsVerticalScrollIndicator={false}
      >
        <BrandLockup size={30} />

        <Text
          className="text-[27px] font-urbanist-heavy text-ink dark:text-ink-dark mt-lg"
          style={{ lineHeight: 31 }}
        >
          {t('identity.language.title')}
        </Text>
        <Text className="text-body font-urbanist-medium text-sub dark:text-sub-dark mt-sm">
          {t('identity.language.subtitle')}
        </Text>

        <View
          accessibilityRole="radiogroup"
          className="gap-sm mt-lg"
        >
          {LOCALE_META.map((meta) => (
            <SelectRow
              key={meta.code}
              testID={`lang-row-${meta.code}`}
              code={meta.chip}
              label={meta.nativeLabel}
              sublabel={meta.englishName}
              selected={selected === meta.code}
              onPress={() => previewLanguage(meta.code)}
            />
          ))}
        </View>

        <View className="flex-1 min-h-[24px]" />

        <Button
          testID="lang-continue"
          label={t('identity.language.continue')}
          onPress={onContinue}
        />
      </ScrollView>
    </View>
  );
}
