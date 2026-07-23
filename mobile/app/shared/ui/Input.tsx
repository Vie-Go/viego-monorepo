import React, { forwardRef, useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { lightColors, darkColors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface InputProps extends TextInputProps {
  /** Inline error message; switches the border to crimson and shows the text below. */
  error?: string | null;
  /** Accessible label (falls back to `placeholder`). */
  label?: string;
  /** Trailing adornment inside the field (e.g. a password show/hide IconButton). */
  rightSlot?: React.ReactNode;
}

/**
 * Text field — height 52, radius 16, 1.5px border, `surface` fill, 18px horizontal padding
 * (prototype). States: idle / focused (crimson border) / filled / error / disabled (FR-010).
 * Optional `rightSlot` renders a trailing control (password reveal). Hand-built on `TextInput`.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { error, label, rightSlot, onFocus, onBlur, editable = true, ...props },
  ref,
) {
  const { themeName } = useTheme();
  const colors = themeName === 'dark' ? darkColors : lightColors;
  const [focused, setFocused] = useState(false);

  const borderColor = error ? '#BE382A' : focused ? '#BE382A' : colors.line;

  return (
    <View className="self-stretch gap-xs">
      <View className="self-stretch justify-center">
        <TextInput
          ref={ref}
          accessibilityLabel={label ?? props.placeholder}
          editable={editable}
          placeholderTextColor={colors.sub}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            height: 52,
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor,
            backgroundColor: colors.surface,
            paddingLeft: 18,
            paddingRight: rightSlot ? 52 : 18,
            fontSize: 14.5,
            fontFamily: 'Urbanist_600SemiBold',
            color: colors.text,
            opacity: editable ? 1 : 0.5,
          }}
          {...props}
        />
        {rightSlot ? (
          <View className="absolute right-1.5">{rightSlot}</View>
        ) : null}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="text-[12.5px] font-urbanist-semibold text-crimson px-xs"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});
