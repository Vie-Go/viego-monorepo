import React from 'react';
import { View } from 'react-native';

/**
 * Entry route (`/`). Renders nothing — the RoutingGuard in `_layout.tsx` immediately redirects
 * to the correct screen based on stored language/session state.
 */
export default function Index() {
  return <View className="flex-1 bg-bg dark:bg-bg-dark" />;
}
