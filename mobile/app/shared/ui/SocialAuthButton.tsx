import React from 'react';
import { Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { lightColors, darkColors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type SocialProvider = 'google' | 'facebook';

const GOOGLE_SVG_XML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`;

const FACEBOOK_SVG_XML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 666.667 666.667"><defs><clipPath id="a" clipPathUnits="userSpaceOnUse"><path d="M0 700h700V0H0Z"/></clipPath></defs><g clip-path="url(#a)" transform="matrix(1.33333 0 0 -1.33333 -133.333 800)"><path d="M0 0c0 138.071-111.929 250-250 250S-500 138.071-500 0c0-117.245 80.715-215.622 189.606-242.638v166.242h-51.552V0h51.552v32.919c0 85.092 38.508 124.532 122.048 124.532 15.838 0 43.167-3.105 54.347-6.211V81.986c-5.901.621-16.149.932-28.882.932-40.993 0-56.832-15.528-56.832-55.9V0h81.659l-14.028-76.396h-67.631v-171.773C-95.927-233.218 0-127.818 0 0" style="fill:#0866ff;fill-opacity:1;fill-rule:nonzero;stroke:none" transform="translate(600 350)"/><path d="m0 0 14.029 76.396H-67.63v27.019c0 40.372 15.838 55.899 56.831 55.899 12.733 0 22.981-.31 28.882-.931v69.253c-11.18 3.106-38.509 6.212-54.347 6.212-83.539 0-122.048-39.441-122.048-124.533V76.396h-51.552V0h51.552v-166.242a250.559 250.559 0 0 1 60.394-7.362c10.254 0 20.358.632 30.288 1.831V0Z" style="fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none" transform="translate(447.918 273.604)"/></g></svg>`;

const PROVIDER_META: Record<
  SocialProvider,
  { label: string; xml: string }
> = {
  google: { label: 'Google', xml: GOOGLE_SVG_XML },
  facebook: { label: 'Facebook', xml: FACEBOOK_SVG_XML },
};

export interface SocialAuthButtonProps {
  provider: SocialProvider;
  onPress?: () => void;
  /** Not-yet-wired providers render dimmed and non-interactive (FR-025; US3 scenario 4). */
  disabled?: boolean;
  testID?: string;
}

/**
 * 56px circular social-provider button — `surface` fill, 1.5px `line` border, SVG brand icon from assets/icons.
 * Providers that aren't wired yet (Facebook) pass `disabled` to communicate unavailability (FR-025).
 * Hand-built on `Pressable`.
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
      <SvgXml xml={meta.xml} width={26} height={26} />
    </Pressable>
  );
}
