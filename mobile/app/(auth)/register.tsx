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
import { register, AuthError } from '../shared/mock/explorerRepository';
import { validateRegister, hasErrors, FieldErrors, RegisterFields } from '../shared/lib/validation';

/**
 * Register (US2) — name/email/password form against the mock repository (zero backend calls,
 * FR-020). Duplicate email → inline error with fields preserved (FR-023). Success → signed-in
 * session + navigate to Onboarding (FR-020, FR-022, FR-024, FR-027).
 */
export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const signIn = useSessionStore((s) => s.signIn);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<keyof RegisterFields>>({});
  const [formError, setFormError] = useState<TranslationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const fieldErrors = validateRegister({ name, email, password });
    setErrors(fieldErrors);
    setFormError(null);
    if (hasErrors(fieldErrors)) return;

    setSubmitting(true);
    try {
      const explorer = await register({ displayName: name, email, password });
      signIn(explorer.id); // session signed-in; onboarding not yet complete → guard shows it
      router.replace('/(auth)/onboarding');
    } catch (e) {
      if (e instanceof AuthError && e.code === 'duplicate-email') {
        // Preserve entered fields; surface the duplicate-email error (FR-023).
        setErrors({ email: undefined });
        setFormError('identity.register.errorDuplicate');
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
          {t('identity.register.title')}
        </Text>
        <Text className="text-body font-urbanist-medium text-sub dark:text-sub-dark mt-xs">
          {t('identity.register.subtitle')}
        </Text>

        <View className="gap-sm mt-lg">
          <Input
            label={t('identity.register.name')}
            placeholder={t('identity.register.name')}
            value={name}
            onChangeText={setName}
            error={errors.name ? t(errors.name) : null}
            autoCapitalize="words"
            textContentType="name"
          />
          <Input
            label={t('identity.register.email')}
            placeholder={t('identity.register.email')}
            value={email}
            onChangeText={setEmail}
            error={errors.email ? t(errors.email) : formError ? t(formError) : null}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
          />
          <PasswordInput
            label={t('identity.register.password')}
            placeholder={t('identity.register.password')}
            value={password}
            onChangeText={setPassword}
            error={errors.password ? t(errors.password) : null}
            textContentType="newPassword"
          />
        </View>

        <Text className="text-[12px] font-urbanist-medium text-sub dark:text-sub-dark mt-sm leading-[18px]">
          {t('identity.register.consent')}
        </Text>

        <View className="mt-md">
          <Button
            testID="register-submit"
            label={t('identity.register.submit')}
            onPress={onSubmit}
            loading={submitting}
          />
        </View>

        <View className="mt-lg">
          <Divider label={t('identity.register.orSignUp')} />
        </View>
        <View className="flex-row gap-md justify-center mt-md">
          <SocialAuthButton provider="google" />
          <SocialAuthButton provider="facebook" disabled />
          <SocialAuthButton provider="zalo" disabled />
        </View>

        <View className="flex-1 min-h-[20px]" />

        <View className="flex-row justify-center mt-lg">
          <Text className="text-[13.5px] font-urbanist-semibold text-sub dark:text-sub-dark">
            {t('identity.register.haveAccount')}{' '}
          </Text>
          <Text
            testID="register-login-link"
            accessibilityRole="link"
            onPress={() => router.replace('/(auth)/login')}
            className="text-[13.5px] font-urbanist-heavy text-crimson"
          >
            {t('identity.register.login')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
