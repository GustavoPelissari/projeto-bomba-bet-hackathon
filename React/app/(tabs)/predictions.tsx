import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { theme } from '../../constants/theme';
import { listMyPredictions } from '../../services/predictionService';
import { listMatches } from '../../services/matchService';
import type { Match, Prediction, PredictionCriterion } from '../../types/domain';
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';
import TeamRow from '../../components/TeamRow';

const CRITERION_SHORT: Record<PredictionCriterion, string> = {
  EXACT: 'Placar exato',
  WINNER: 'Acertou o vencedor',
  MISS: 'Sem pontos',
};

type Item = { prediction: Prediction; match: Match };

export default function PredictionsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega palpites e partidas e combina cada palpite com a sua partida.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [preds, matches] = await Promise.all([
        listMyPredictions(),
        listMatches(),
      ]);
      const byId = new Map(matches.map((m) => [m.id, m]));
      const joined: Item[] = preds
        .map((p) => {
          const match = byId.get(p.matchId);
          return match ? { prediction: p, match } : null;
        })
        .filter((x): x is Item => x !== null)
        .sort(
          (a, b) =>
            new Date(b.match.datetime).getTime() -
            new Date(a.match.datetime).getTime()
        );
      setItems(joined);
      setTotalPoints(
        preds.reduce((sum, p) => sum + (p.points ?? 0), 0)
      );
    } catch {
      setError('Não foi possível carregar seus palpites. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || error) {
    return (
      <ScreenContainer>
        <StateView loading={loading} error={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  const renderItem = ({ item }: { item: Item }) => {
    const { prediction, match } = item;
    const finished = match.status === 'FINISHED';

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({ pathname: '/match/[id]', params: { id: match.id } })
        }
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Palpite ${match.homeTeam.name} ${prediction.homeGuess} a ${prediction.awayGuess} ${match.awayTeam.name}`}
        accessibilityHint="Abre os detalhes da partida"
        style={styles.card}
      >
        <View style={styles.teams}>
          <TeamRow team={match.homeTeam} />
          <TeamRow team={match.awayTeam} />
        </View>

        <View style={styles.divider} />

        <View style={styles.guessRow}>
          <Text style={styles.guessLabel}>Seu palpite</Text>
          <Text style={styles.guessValue}>
            {prediction.homeGuess} x {prediction.awayGuess}
          </Text>
        </View>

        {finished ? (
          <>
            <View style={styles.guessRow}>
              <Text style={styles.guessLabel}>Resultado</Text>
              <Text style={styles.guessValue}>
                {match.homeScore} x {match.awayScore}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Ionicons
                name={
                  prediction.criterion === 'MISS'
                    ? 'close-circle-outline'
                    : 'checkmark-circle-outline'
                }
                size={16}
                color={
                  prediction.criterion === 'MISS'
                    ? theme.colors.danger
                    : theme.colors.success
                }
                accessible={false}
              />
              <Text style={styles.statusText}>
                {prediction.criterion
                  ? CRITERION_SHORT[prediction.criterion]
                  : 'Aguardando'}
              </Text>
              <View style={styles.spacer} />
              <Text style={styles.points}>{prediction.points ?? 0} pts</Text>
            </View>
          </>
        ) : (
          <View style={styles.statusRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={theme.colors.textSecondary}
              accessible={false}
            />
            <Text style={styles.waitingText}>Aguardando</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer noPadding>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.prediction.id)}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Meus Palpites
            </Text>
            <Text style={styles.subtitle}>
              {items.length}{' '}
              {items.length === 1 ? 'palpite' : 'palpites'} · {totalPoints} pts
            </Text>
          </View>
        }
        ListEmptyComponent={
          <StateView
            empty
            emptyIcon="create-outline"
            emptyMessage="Você ainda não fez palpites."
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.font.h1,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  teams: {
    gap: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  guessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guessLabel: {
    ...theme.font.label,
    color: theme.colors.textSecondary,
  },
  guessValue: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  statusText: {
    ...theme.font.body,
    color: theme.colors.textPrimary,
  },
  waitingText: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
  },
  spacer: {
    flex: 1,
  },
  points: {
    ...theme.font.title,
    color: theme.colors.accent,
  },
});
