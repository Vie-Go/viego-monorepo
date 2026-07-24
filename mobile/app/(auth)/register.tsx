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
 * Register — the same passwordless email-code/Google flow as Log in (T040): the contract's
 * `POST /auth/{provider}` request for email only carries `email`/`code` (no display-name field —
 * `RegisterOrSignInService` always derives it from the email local part or the Google profile
 * name), so there is no "Full name" input to collect here — display-name customization is a
 * later, separate feature, not one this contract exposes yet. Sign-in and registration are the
 * same find-or-create call server-side (FR-001/FR-002); the only difference from Log in is this
 * screen's copy and its post-success destination (Onboarding, not main — FR-020/FR-022).
 */
export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const signIn = useSessionStore((s) => s.signIn);

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<FieldErrors<keyof LoginFields>>({});
  const [banner, setBanner] = useState<TranslationKey | null>(null);

  const onSessionEstablished = (session: Session) => {
    setTokens(session.accessToken, session.refreshToken);
    queryClient.setQueryData(['identity', 'me'], session.explorer);
    signIn(session.explorer.id); // onboarding not yet complete → guard shows it
    router.replace('/(auth)/onboarding');
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
          {step === 'email' ? t('identity.register.title') : t('identity.emailCode.title')}
        </Text>
        <Text className="text-body font-urbanist-medium text-sub dark:text-sub-dark mt-xs">
          {step === 'email' ? t('identity.register.subtitle') : `${t('identity.emailCode.subtitle')} ${email}`}
        </Text>

        {banner ? (
          <View
            accessibilityLiveRegion="polite"
            className="mt-md rounded-md bg-crimson/10 border-[1.5px] border-crimson px-md py-sm"
          >
            <Text testID="register-error" className="text-[13px] font-urbanist-semibold text-crimson">
              {t(banner)}
            </Text>
          </View>
        ) : null}

        {step === 'email' ? (
          <>
            <View className="gap-sm mt-lg">
              <Input
                label={t('identity.register.email')}
                placeholder={t('identity.register.email')}
                value={email}
                onChangeText={setEmail}
                error={errors.email ? t(errors.email) : null}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
              />
            </View>

            <Text className="text-[12px] font-urbanist-medium text-sub dark:text-sub-dark mt-sm leading-[18px]">
              {t('identity.register.consent')}
            </Text>

            <View className="mt-md">
              <Button
                testID="register-submit"
                label={t('identity.register.sendCode')}
                onPress={onSubmitEmail}
                loading={challengeMutation.isPending}
              />
            </View>

            <View className="mt-lg">
              <Divider label={t('identity.register.orSignUp')} />
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
                testID="register-code-submit"
                label={t('identity.emailCode.submit')}
                onPress={onSubmitCode}
                loading={signInMutation.isPending}
              />
            </View>

            <View className="flex-row justify-between mt-md">
              <Text
                testID="register-resend-code"
                accessibilityRole="link"
                onPress={() => challengeMutation.mutate(email)}
                className="text-[13px] font-urbanist-semibold text-crimson"
              >
                {t('identity.emailCode.resend')}
              </Text>
              <Text
                testID="register-change-email"
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
