import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getStatus } from '../shared/api/client';
import { useTheme } from '../shared/theme/ThemeProvider';
import { useI18n } from '../shared/i18n/I18nProvider';
import { Button, Card } from '../shared/ui';
import { spacing } from '../shared/theme/tokens';

/**
 * The walking-skeleton slice (US1): calls GET /api/v1/status and renders a healthy result,
 * or a graceful error/retry state when the backend is unreachable (never a crash).
 */
export function ConnectivityCard() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['platform', 'status'],
    queryFn: getStatus,
    retry: 1,
  });

  return (
    <Card>
      <Text style={{ color: theme.text, fontWeight: '800' }}>{t('status.title')}</Text>
      {isLoading || isFetching ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <ActivityIndicator color={theme.primary} />
          <Text style={{ color: theme.textMuted }}>{t('status.checking')}</Text>
        </View>
      ) : isError ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>{t('status.error')}</Text>
          <Button label={t('status.retry')} onPress={() => refetch()} />
        </View>
      ) : (
        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>{t('status.healthy')}</Text>
          <Text style={{ color: theme.textMuted }}>
            {data?.service} · {data?.version}
          </Text>
        </View>
      )}
    </Card>
  );
}
