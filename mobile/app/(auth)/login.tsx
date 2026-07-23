import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLockup } from '../shared/ui/BrandLockup';
import { Input } from '../shared/ui/Input';
import { PasswordInput } from '../shared/ui/PasswordInput';
import { Button } from '../shared/ui/Button';
import { Divider } from '../shared/ui/Divider';
import { SocialAuthButton } from '../shared/ui/SocialAuthButton';
import { useI18n } from '../shared/i18n/I18nProvider';
import type { TranslationKey } from '../shared/i18n/translations';
import { useSessionStore } from '../shared/store/sessionStore';
import { login, AuthError } from '../shared/mock/explorerRepository';
import { validateLogin, hasErrors, FieldErrors, LoginFields } from '../shared/lib/validation';

/**
 * Log in (US3) — returning-Explorer sign-in against the mock repository. Invalid credentials →
 * a clear error banner with the entered email preserved (FR-023). Success → signed-in session,
 * onboarding marked complete, straight to main — Onboarding is skipped for returning Explorers
 * (US3 scenario 1). Facebook renders disabled (FR-025; scenario 4).
 */
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const signIn = useSessionStore((s) => s.signIn);
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<keyof LoginFields>>({});
  const [banner, setBanner] = useState<TranslationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const fieldErrors = validateLogin({ email, password });
    setErrors(fieldErrors);
    setBanner(null);
    if (hasErrors(fieldErrors)) return;

    setSubmitting(true);
    try {
      const explorer = await login({ email, password });
      signIn(explorer.id);
      completeOnboarding(); // returning Explorer skips Onboarding (US3 scenario 1)
      router.replace('/main');
    } catch (e) {
      if (e instanceof AuthError && e.code === 'invalid-credentials') {
        setBanner('identity.login.error'); // email stays in state → preserved (FR-023)
      } else {
        throw e;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg dark:bg-bg-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: Math.max(insets.top, 44) + 44,
          paddingHorizontal: 26,
          paddingBottom: Math.max(insets.bottom, 30),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandLockup size={30} />

        <Text className="text-headline font-urbanist-heavy text-ink dark:text-ink-dark mt-lg">
          {t('identity.login.title')}
        </Text>
        <Text className="text-body font-urbanist-medium text-sub dark:text-sub-dark mt-xs">
          {t('identity.login.subtitle')}
        </Text>

        {banner ? (
          <View
            accessibilityLiveRegion="polite"
            className="mt-md rounded-md bg-crimson/10 border-[1.5px] border-crimson px-md py-sm"
          >
            <Text testID="login-error" className="text-[13px] font-urbanist-semibold text-crimson">
              {t(banner)}
            </Text>
          </View>
        ) : null}

        <View className="gap-sm mt-lg">
          <Input
            label={t('identity.login.email')}
            placeholder={t('identity.login.email')}
            value={email}
            onChangeText={setEmail}
            error={errors.email ? t(errors.email) : null}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
          />
          <PasswordInput
            label={t('identity.login.password')}
            placeholder={t('identity.login.password')}
            value={password}
            onChangeText={setPassword}
            error={errors.password ? t(errors.password) : null}
            textContentType="password"
          />
        </View>

        <View className="flex-row justify-end mt-sm">
          <Text
            accessibilityRole="link"
            className="text-[12.5px] font-urbanist-bold text-crimson"
          >
            {t('identity.login.forgot')}
          </Text>
        </View>

        <View className="mt-md">
          <Button
            testID="login-submit"
            label={t('identity.login.submit')}
            onPress={onSubmit}
            loading={submitting}
          />
        </View>

        <View className="mt-lg">
          <Divider label={t('identity.login.orContinue')} />
        </View>
        <View className="flex-row gap-md justify-center mt-md">
          <SocialAuthButton provider="google" />
          <SocialAuthButton provider="facebook" disabled />
        </View>

        <View className="flex-1 min-h-[20px]" />

        <View className="flex-row justify-center mt-lg">
          <Text className="text-[13.5px] font-urbanist-semibold text-sub dark:text-sub-dark">
            {t('identity.login.noAccount')}{' '}
          </Text>
          <Text
            testID="login-register-link"
            accessibilityRole="link"
            onPress={() => router.replace('/(auth)/register')}
            className="text-[13.5px] font-urbanist-heavy text-crimson"
          >
            {t('identity.login.createAccount')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
