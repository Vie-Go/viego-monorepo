import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../shared/theme/ThemeProvider';
import { useI18n } from '../shared/i18n/I18nProvider';
import { TranslationKey } from '../shared/i18n/translations';
import { spacing } from '../shared/theme/tokens';

/** Generic tab placeholder for the Phase 0 shell; each tab's real screen arrives in P1–P4. */
export function Placeholder({ messageKey }: { messageKey: TranslationKey }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.textMuted }]}>{t(messageKey)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  text: { fontSize: 16, textAlign: 'center' },
});
