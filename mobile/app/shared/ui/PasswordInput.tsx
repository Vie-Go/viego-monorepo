import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { Input, InputProps } from './Input';
import { IconButton } from './IconButton';

export type PasswordInputProps = Omit<InputProps, 'secureTextEntry' | 'rightSlot'>;

/**
 * Password field with a show/hide reveal toggle (design identity.md adds this vs. the prototype's
 * plain field). Wraps `Input`; the toggle is an accessible `IconButton`.
 */
export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      rightSlot={
        <IconButton
          icon={visible ? EyeOff : Eye}
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible((v) => !v)}
        />
      }
    />
  );
}
