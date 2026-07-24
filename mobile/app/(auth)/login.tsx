import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BrandLockup } from '../shared/ui/BrandLockup';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';
import { Divider } from '../shared/ui/Divider';
import { SocialAuthButton } from '../shared/ui/SocialAuthButton';
import { useI18n } from '../shared/i18n/I18nProvider';
import type { TranslationKey } from '../shared/i18n/translations';
import { useSessionStore } from '../shared/store/sessionStore';
import { setTokens } from '../shared/api/authTokenStore';
import { requestEmailChallenge, signInWithEmailCode, signInWithGoogle, Session } from '../shared/api/auth';
import { useGoogleSignIn } from '../shared/api/useGoogleSignIn';
import { validateLogin, hasErrors, FieldErrors, LoginFields } from '../shared/lib/validation';

/**
 * Log in — passwordless: an email one-time code (research R3), or Google. No password field
 * (NFR-SEC-04). Success → tokens in secure storage, the ['identity','me'] cache seeded, session
 * signed in, straight to main (returning Explorer skips Onboarding). FR-018: a connectivity
 * failure surfaces as its own banner, distinct from an invalid/expired code.
 */
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const signIn = useSessionStore((s) => s.signIn);
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<FieldErrors<keyof LoginFields>>({});
  const [banner, setBanner] = useState<TranslationKey | null>(null);

  const onSessionEstablished = (session: Session) => {
    setTokens(session.accessToken, session.refreshToken);
    queryClient.setQueryData(['identity', 'me'], session.explorer);
    signIn(session.explorer.id);
    completeOnboarding(); // returning Explorer skips Onboarding
    router.replace('/main');
  };

  const onAuthError = (error: unknown, invalidKey: TranslationKey) => {
    setBanner(error instanceof TypeError ? 'identity.emailCode.connectivityError' : invalidKey);
  };

  const challengeMutation = useMutation({
    mutationFn: (targetEmail: string) => requestEmailChallenge(targetEmail),
    onSuccess: () => setStep('code'),
    onError: (error) => onAuthError(error, 'identity.emailCode.connectivityError'),
  });

  const signInMutation = useMutation({
    mutationFn: () => signInWithEmailCode(email, code),
    onSuccess: onSessionEstablished,
    onError: (error) => onAuthError(error, 'identity.emailCode.invalid'),
  });

  const googleMutation = useMutation({
    mutationFn: (idToken: string) => signInWithGoogle(idToken),
    onSuccess: onSessionEstablished,
    onError: (error) => onAuthError(error, 'identity.emailCode.connectivityError'),
  });
  const google = useGoogleSignIn((idToken) => googleMutation.mutate(idToken));

  const onSubmitEmail = () => {
    const fieldErrors = validateLogin({ email });
    setErrors(fieldErrors);
    setBanner(null);
    if (hasErrors(fieldErrors)) return;
    challengeMutation.mutate(email);
  };

  const onSubmitCode = () => {
    setBanner(null);
    signInMutation.mutate();
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
          {step === 'email' ? t('identity.login.title') : t('identity.emailCode.title')}
        </Text>
        <Text className="text-body font-urbanist-medium text-sub dark:text-sub-dark mt-xs">
          {step === 'email' ? t('identity.login.subtitle') : `${t('identity.emailCode.subtitle')} ${email}`}
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

        {step === 'email' ? (
          <>
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
            </View>

            <View className="mt-md">
              <Button
                testID="login-submit"
                label={t('identity.login.sendCode')}
                onPress={onSubmitEmail}
                loading={challengeMutation.isPending}
              />
            </View>

            <View className="mt-lg">
              <Divider label={t('identity.login.orContinue')} />
            </View>
            <View className="flex-row gap-md justify-center mt-md">
              <SocialAuthButton
                provider="google"
                onPress={() => google.ready && google.promptAsync()}
              />
              <SocialAuthButton provider="facebook" disabled />
            </View>
          </>
        ) : (
          <>
            <View className="gap-sm mt-lg">
              <Input
                label={t('identity.emailCode.label')}
                placeholder={t('identity.emailCode.label')}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
              />
            </View>

            <View className="mt-md">
              <Button
                testID="login-code-submit"
                label={t('identity.emailCode.submit')}
                onPress={onSubmitCode}
                loading={signInMutation.isPending}
              />
            </View>

            <View className="flex-row justify-between mt-md">
              <Text
                testID="login-resend-code"
                accessibilityRole="link"
                onPress={() => challengeMutation.mutate(email)}
                className="text-[13px] font-urbanist-semibold text-crimson"
              >
                {t('identity.emailCode.resend')}
              </Text>
              <Text
                testID="login-change-email"
                accessibilityRole="link"
                onPress={() => {
                  setStep('email');
                  setBanner(null);
                }}
                className="text-[13px] font-urbanist-semibold text-sub dark:text-sub-dark"
              >
                {t('identity.emailCode.back')}
              </Text>
            </View>
          </>
        )}

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
