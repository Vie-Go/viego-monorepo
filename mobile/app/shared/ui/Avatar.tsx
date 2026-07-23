import React from 'react';
import { Image, Text, View } from 'react-native';
import { palette } from '../theme/tokens';

export interface AvatarProps {
  /** Remote/local image; falls back to initials when absent. */
  uri?: string;
  /** Display name — the first initial is used for the fallback. */
  name: string;
  size?: number;
  /** Gold ring (Profile hero). */
  ring?: boolean;
  testID?: string;
}

/**
 * Round avatar — image or initials fallback, optional gold ring (design identity.md Profile).
 * Sourced from the `avatar` primitive (image + fallback). Unwired this feature — first consumer:
 * Profile & Preferences (FR-015).
 */
export function Avatar({ uri, name, size = 48, ring = false, testID }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 3 : 0,
        borderColor: palette.gold,
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Text style={{ color: '#FFFFFF', fontSize: size * 0.4 }} className="font-urbanist-heavy">
          {initial}
        </Text>
      )}
    </View>
  );
}
