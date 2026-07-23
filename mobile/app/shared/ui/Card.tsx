import React from 'react';
import { View, ViewProps } from 'react-native';
import { shadow as shadowTokens } from '../theme/tokens';

export interface CardProps extends ViewProps {
  /** Drop the ambient elevation (e.g. nested cards). */
  flat?: boolean;
}

/**
 * Container surface — radius 20, `card` fill, `shadow.card` ambient elevation (design-system.md
 * "Cards"). Plain `View`; hand-built. Unwired this feature — first consumer: Profile & Preferences
 * (FR-012).
 */
export function Card({ flat = false, style, className, children, ...rest }: CardProps) {
  return (
    <View
      style={[flat ? undefined : shadowTokens.card, style]}
      className={['bg-card dark:bg-card-dark rounded-[20px] p-md', className ?? ''].join(' ')}
      {...rest}
    >
      {children}
    </View>
  );
}
