import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../shared/theme/ThemeProvider';
import { useI18n } from '../shared/i18n/I18nProvider';
import { Button } from '../shared/ui';
import { spacing } from '../shared/theme/tokens';
import { ConnectivityCard } from './ConnectivityCard';
import type { WelcomeScreenProps } from '../navigation/types';

/** Auth-stack entry: brand, the live connectivity check (US1), and enter-the-app actions. */
export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.brand, { color: theme.primary }]}>{t('app.name')}</Text>
      <Text style={[styles.welcome, { color: theme.text }]}>{t('auth.welcome')}</Text>

      <ConnectivityCard />

      <View style={styles.actions}>
        <Button label={t('auth.signIn')} onPress={() => navigation.navigate('Main')} />
        <Button variant="secondary" label={t('auth.register')} onPress={() => navigation.navigate('Main')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: 'center' },
  brand: { fontSize: 40, fontWeight: '800', textAlign: 'center' },
  welcome: { fontSize: 18, textAlign: 'center' },
  actions: { gap: spacing.sm },
});
