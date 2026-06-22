import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import type { Team } from '../types/domain';

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

type Props = {
  team: Team;
  score?: number | null;
  /** Versão maior, usada na tela de detalhes. */
  large?: boolean;
  highlight?: boolean;
};

// Linha com bandeira + nome + sigla de um time, com placar opcional.
export default function TeamRow({ team, score, large, highlight }: Props) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={
        score != null
          ? `${team.name}, ${score} gols`
          : team.name
      }
    >
      {team.flag && isUrl(team.flag) ? (
        <Image
          source={{ uri: team.flag }}
          style={[styles.flagImage, large && styles.flagImageLarge]}
          resizeMode="cover"
          accessible={false}
        />
      ) : (
        <Text
          style={[styles.flag, large && styles.flagLarge]}
          accessible={false}
        >
          {team.flag}
        </Text>
      )}
      <View style={styles.names}>
        <Text
          style={[
            styles.name,
            large && styles.nameLarge,
            highlight && styles.highlight,
          ]}
          numberOfLines={1}
        >
          {team.name}
        </Text>
        <Text style={styles.code}>{team.fifaCode}</Text>
      </View>
      {score != null ? (
        <Text style={[styles.score, large && styles.scoreLarge]}>{score}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  flag: {
    fontSize: 24,
  },
  flagLarge: {
    fontSize: 40,
  },
  flagImage: {
    width: 32,
    height: 22,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceAlt,
  },
  flagImageLarge: {
    width: 56,
    height: 38,
    borderRadius: 4,
  },
  names: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  name: {
    ...theme.font.body,
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
  nameLarge: {
    ...theme.font.title,
  },
  highlight: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  code: {
    ...theme.font.caption,
    color: theme.colors.textSecondary,
  },
  score: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  scoreLarge: {
    ...theme.font.h1,
  },
});
