import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import type { Match } from '../types/domain';
import { formatDate } from '../utils/format';
import StatusPill from './StatusPill';
import TeamRow from './TeamRow';

type Props = {
  match: Match;
  onPress?: () => void;
};

export default function MatchCard({ match, onPress }: Props) {
  const showScore = match.status !== 'SCHEDULED';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${match.homeTeam.name} contra ${match.awayTeam.name}, ${formatDate(
        match.datetime
      )}, ${match.stadium}`}
      accessibilityHint="Abre os detalhes da partida"
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.meta}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={theme.colors.textSecondary}
            accessible={false}
          />
          <Text style={styles.metaText}>{formatDate(match.datetime)}</Text>
        </View>
        <StatusPill status={match.status} />
      </View>

      <View style={styles.stadiumRow}>
        <Ionicons
          name="location-outline"
          size={13}
          color={theme.colors.textSecondary}
          accessible={false}
        />
        <Text style={styles.metaText} numberOfLines={1}>
          {match.stadium}
        </Text>
      </View>

      <View style={styles.teams}>
        <TeamRow
          team={match.homeTeam}
          score={showScore ? match.homeScore : undefined}
        />
        <TeamRow
          team={match.awayTeam}
          score={showScore ? match.awayScore : undefined}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  stadiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    ...theme.font.caption,
    color: theme.colors.textSecondary,
    flexShrink: 1,
  },
  teams: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
});
