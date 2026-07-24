import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../shared/theme/ThemeProvider';
import { useI18n } from '../shared/i18n/I18nProvider';
import { Button, Card } from '../shared/ui';
import { spacing, lightTheme, darkTheme } from '../shared/theme/tokens';
import { getMe, updatePreferences, Explorer, Preferences } from '../shared/api/auth';

const THEME_ORDER: Preferences['theme'][] = ['light', 'dark'];
const LANGUAGE_ORDER: Preferences['language'][] = ['vi', 'en', 'ko', 'ja', 'fr'];

function next<T>(order: T[], current: T): T {
  return order[(order.indexOf(current) + 1) % order.length];
}

/**
 * Profile tab — language + theme switches now read/write the signed-in Explorer's real server
 * preferences (US4), replacing the earlier device-only toggle. Changes apply optimistically to
 * the shared `['identity','me']` cache and roll back on failure.
 */
export function ProfileScreen() {
  // shared/ui's Button/Card (below) predate the current ThemeColors token set and still expect
  // the "backward-compatible" Theme shape (background/textMuted/...) tokens.ts documents for
  // exactly this pre-migration screen — not the ThemeColors useTheme() itself now returns.
  const { themeName } = useTheme();
  const theme = themeName === 'dark' ? darkTheme : lightTheme;
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: explorer } = useQuery({ queryKey: ['identity', 'me'], queryFn: getMe });
  const preferences = explorer?.preferences;

  const mutation = useMutation({
    mutationFn: updatePreferences,
    onMutate: async (nextPreferences: Preferences) => {
      await queryClient.cancelQueries({ queryKey: ['identity', 'me'] });
      const previous = queryClient.getQueryData<Explorer>(['identity', 'me']);
      if (previous) {
        queryClient.setQueryData<Explorer>(['identity', 'me'], {
          ...previous,
          preferences: nextPreferences,
        });
      }
      return { previous };
    },
    onError: (_error, _nextPreferences, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['identity', 'me'], context.previous);
      }
    },
  });

  const cycleTheme = () => {
    if (!preferences) return;
    mutation.mutate({ ...preferences, theme: next(THEME_ORDER, preferences.theme) });
  };

  const cycleLanguage = () => {
    if (!preferences) return;
    mutation.mutate({ ...preferences, language: next(LANGUAGE_ORDER, preferences.language) });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.h1, { color: theme.text }]}>{t('tab.profile')}</Text>
      <Text style={{ color: theme.textMuted }}>{t('placeholder.profile')}</Text>

      <Card>
        <View style={styles.row}>
          <Text style={{ color: theme.text }}>{`Theme: ${preferences?.theme ?? '…'}`}</Text>
          <Button
            variant="secondary"
            label={t('action.toggleTheme')}
            onPress={cycleTheme}
          />
        </View>
        <View style={styles.row}>
          <Text style={{ color: theme.text }}>{`Language: ${preferences?.language ?? '…'}`}</Text>
          <Button
            variant="secondary"
            label={t('action.toggleLanguage')}
            onPress={cycleLanguage}
          />
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
