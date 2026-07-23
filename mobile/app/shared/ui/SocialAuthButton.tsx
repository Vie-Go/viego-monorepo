import React from 'react';
import { Pressable, Text } from 'react-native';
import { lightColors, darkColors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type SocialProvider = 'google' | 'facebook' | 'zalo';

const PROVIDER_META: Record<
  SocialProvider,
  { glyph: string; color: string; fontSize: number; label: string }
> = {
  google: { glyph: 'G', color: '#DB4437', fontSize: 20, label: 'Google' },
  facebook: { glyph: 'f', color: '#1877F2', fontSize: 22, label: 'Facebook' },
  zalo: { glyph: 'Zalo', color: '#0068FF', fontSize: 13, label: 'Zalo' },
};

export interface SocialAuthButtonProps {
  provider: SocialProvider;
  onPress?: () => void;
  /** Not-yet-wired providers render dimmed and non-interactive (FR-025; US3 scenario 4). */
  disabled?: boolean;
  testID?: string;
}

/**
 * 56px circular social-provider button — `surface` fill, 1.5px `line` border, brand-tinted
 * glyph (prototype). Providers that aren't wired yet (Facebook, Zalo) pass `disabled` to
 * communicate unavailability (FR-025). Hand-built on `Pressable`.
 */
export function SocialAuthButton({
  provider,
  onPress,
  disabled = false,
  testID,
}: SocialAuthButtonProps) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;
  const meta = PROVIDER_META[provider];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${meta.label}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.line,
        opacity: disabled ? 0.4 : 1,
      }}
      className="items-center justify-center active:opacity-70"
    >
      <Text
        style={{ color: meta.color, fontSize: meta.fontSize }}
        className="font-urbanist-heavy"
      >
        {meta.glyph}
      </Text>
    </Pressable>
  );
}
