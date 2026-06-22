import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import type { MatchStatus } from '../types/domain';

type Config = {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CONFIG: Record<MatchStatus, Config> = {
  SCHEDULED: { label: 'Agendada', color: theme.colors.scheduled, icon: 'time-outline' },
  LIVE: { label: 'Ao vivo', color: theme.colors.live, icon: 'radio-outline' },
  FINISHED: { label: 'Encerrada', color: theme.colors.textSecondary, icon: 'checkmark-done-outline' },
};

// Etiqueta arredondada que mostra a situação de uma partida.
export default function StatusPill({ status }: { status: MatchStatus }) {
  const cfg = CONFIG[status];
  return (
    <View
      style={[styles.pill, { borderColor: cfg.color }]}
      accessible
      accessibilityLabel={`Situação: ${cfg.label}`}
    >
      <Ionicons name={cfg.icon} size={13} color={cfg.color} accessible={false} />
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md - 2,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.font.caption,
    fontWeight: '600',
  },
});
