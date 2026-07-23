import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { shadow as shadowTokens } from '../theme/tokens';

export type ButtonVariant = 'primary' | 'gold' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  /** Override the auto-width; buttons are full-width by default (prototype). */
  fullWidth?: boolean;
  testID?: string;
}

/**
 * Full-pill CTA (height 54, radius 27) — prototype `#BE382A` crimson primary with the crimson
 * glow shadow, gold action pill, or ghost (1.5px line border). Pressed scale 0.97. No
 * `@rn-primitives` equivalent; hand-built on a NativeWind `Pressable` (FR-008, FR-009).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerByVariant: Record<ButtonVariant, string> = {
    primary: 'bg-crimson',
    gold: 'bg-gold',
    ghost: 'bg-transparent border-[1.5px] border-line dark:border-line-dark',
  };
  const textByVariant: Record<ButtonVariant, string> = {
    primary: 'text-white',
    gold: 'text-on-gold',
    ghost: 'text-ink dark:text-ink-dark',
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      // Crimson glow is reserved for the primary CTA only (design-system rule).
      style={variant === 'primary' && !isDisabled ? shadowTokens.glow : undefined}
      className={[
        'h-[54px] rounded-full items-center justify-center px-lg active:scale-[0.97]',
        fullWidth ? 'self-stretch' : 'self-auto',
        containerByVariant[variant],
        isDisabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#BE382A' : '#FFFFFF'} />
      ) : (
        <View className="flex-row items-center gap-sm">
          <Text
            className={['text-[16px] font-urbanist-bold', textByVariant[variant]].join(' ')}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
