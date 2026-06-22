import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import Button from './Button';

type Props = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  loadingMessage?: string;
  onRetry?: () => void;
};

// Renderiza os estados de carregando / erro / vazio. Retorna null quando há conteúdo.
export default function StateView({
  loading,
  error,
  empty,
  emptyMessage = 'Nada por aqui ainda.',
  emptyIcon = 'file-tray-outline',
  loadingMessage = 'Carregando…',
  onRetry,
}: Props) {
  if (loading) {
    return (
      <View style={styles.container} accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.message}>{loadingMessage}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Ionicons
          name="cloud-offline-outline"
          size={40}
          color={theme.colors.danger}
          accessible={false}
        />
        <Text style={styles.message} accessibilityLiveRegion="polite">
          {error}
        </Text>
        {onRetry ? (
          <View style={styles.action}>
            <Button
              title="Tentar novamente"
              variant="ghost"
              fullWidth={false}
              icon="refresh"
              onPress={onRetry}
            />
          </View>
        ) : null}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.container}>
        <Ionicons
          name={emptyIcon}
          size={40}
          color={theme.colors.textSecondary}
          accessible={false}
        />
        <Text style={styles.message}>{emptyMessage}</Text>
        {onRetry ? (
          <View style={styles.action}>
            <Button
              title="Atualizar"
              variant="ghost"
              fullWidth={false}
              icon="refresh"
              onPress={onRetry}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  message: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: theme.spacing.sm,
  },
});
