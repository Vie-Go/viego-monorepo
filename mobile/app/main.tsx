import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLockup } from './shared/ui/BrandLockup';
import { useI18n } from './shared/i18n/I18nProvider';

/**
 * Blank main placeholder (US2, FR-031–032) — the post-flow destination. Themed and minimal:
 * confirms the first-launch flow completed. The living map / real home lands in a later feature.
 */
export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <View
      className="flex-1 bg-bg dark:bg-bg-dark items-center justify-center px-lg"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <BrandLockup size={30} testID="main-brand" />
      <Text className="text-headline font-urbanist-heavy text-ink dark:text-ink-dark mt-lg text-center">
        {t('identity.main.title')}
      </Text>
      <Text className="text-body font-urbanist-medium text-sub dark:text-sub-dark mt-sm text-center">
        {t('identity.main.subtitle')}
      </Text>
    </View>
  );
}
