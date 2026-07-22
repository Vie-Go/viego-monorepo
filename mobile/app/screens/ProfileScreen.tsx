import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../shared/theme/ThemeProvider';
import { useI18n } from '../shared/i18n/I18nProvider';
import { Button, Card } from '../shared/ui';
import { spacing } from '../shared/theme/tokens';

/**
 * Profile tab — Phase 0 hosts the language + theme switches (US4). In Phase 1 these
 * bind to the server-side Explorer Preferences.
 */
export function ProfileScreen() {
  const { theme, themeName, toggleTheme } = useTheme();
  const { t, locale, toggleLocale } = useI18n();
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.h1, { color: theme.text }]}>{t('tab.profile')}</Text>
      <Text style={{ color: theme.textMuted }}>{t('placeholder.profile')}</Text>

      <Card>
        <View style={styles.row}>
          <Text style={{ color: theme.text }}>{`Theme: ${themeName}`}</Text>
          <Button variant="secondary" label={t('action.toggleTheme')} onPress={toggleTheme} />
        </View>
        <View style={styles.row}>
          <Text style={{ color: theme.text }}>{`Language: ${locale}`}</Text>
          <Button variant="secondary" label={t('action.toggleLanguage')} onPress={toggleLocale} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, gap: spacing.md },
  h1: { fontSize: 24, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
});
