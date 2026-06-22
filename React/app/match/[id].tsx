import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/theme';
import { getMatch } from '../../services/matchService';
import {
  getPredictionByMatch,
  savePrediction,
} from '../../services/predictionService';
import { formatDate, phaseLabel } from '../../utils/format';
import type { Match, Prediction, PredictionCriterion } from '../../types/domain';
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';
import StatusPill from '../../components/StatusPill';
import TeamRow from '../../components/TeamRow';
import ScoreStepper from '../../components/ScoreStepper';
import Button from '../../components/Button';

const CRITERION_LABEL: Record<PredictionCriterion, string> = {
  EXACT: 'Placar exato (10 pts)',
  WINNER: 'Acertou o vencedor (5 pts)',
  MISS: 'Sem pontos (0)',
};

// Detalhes da partida. O nome do arquivo [id] cria uma rota dinâmica.
export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = Number(id);

  const [match, setMatch] = useState<Match | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Carrega a partida e o palpite atual (se houver) em paralelo.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, p] = await Promise.all([
        getMatch(matchId),
        getPredictionByMatch(matchId),
      ]);
      setMatch(m);
      setPrediction(p);
      if (p) {
        setHome(p.homeGuess);
        setAway(p.awayGuess);
      }
    } catch {
      setError('Não foi possível carregar a partida. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const result = await savePrediction(matchId, home, away);
      setPrediction(result);
      setSaved(true);
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : 'Não foi possível salvar o palpite.'
      );
    } finally {
      setSaving(false);
    }
  };

  const Header = (
    <TouchableOpacity
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.backBtn}
    >
      <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      <Text style={styles.backText}>Voltar</Text>
    </TouchableOpacity>
  );

  if (loading || error || !match) {
    return (
      <ScreenContainer>
        {Header}
        <StateView loading={loading} error={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  const isScheduled = match.status === 'SCHEDULED';
  const isFinished = match.status === 'FINISHED';
  const showScore = !isScheduled;

  return (
    <ScreenContainer noPadding>
      <ScrollView contentContainerStyle={styles.scroll}>
        {Header}

        <View style={styles.metaBlock}>
          <StatusPill status={match.status} />
          <Text style={styles.phase}>
            {phaseLabel(match.phase)}
            {match.group ? ` · Grupo ${match.group}` : ''}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.textSecondary}
              accessible={false}
            />
            <Text style={styles.metaText}>{match.stadium}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={theme.colors.textSecondary}
              accessible={false}
            />
            <Text style={styles.metaText}>{formatDate(match.datetime)}</Text>
          </View>
        </View>

        <View style={styles.confronto}>
          <TeamRow
            team={match.homeTeam}
            score={showScore ? match.homeScore : undefined}
            large
          />
          <Text style={styles.versus}>x</Text>
          <TeamRow
            team={match.awayTeam}
            score={showScore ? match.awayScore : undefined}
            large
          />
        </View>

        {isScheduled ? (
          <View style={styles.predictionBox}>
            <Text style={styles.predictionTitle}>Seu palpite</Text>
            <View style={styles.steppers}>
              <ScoreStepper
                label={match.homeTeam.fifaCode}
                value={home}
                onChange={setHome}
                disabled={saving}
              />
              <Text style={styles.versusSmall}>x</Text>
              <ScoreStepper
                label={match.awayTeam.fifaCode}
                value={away}
                onChange={setAway}
                disabled={saving}
              />
            </View>

            {saveError ? (
              <View style={styles.feedbackRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={theme.colors.danger}
                  accessible={false}
                />
                <Text style={styles.feedbackError} accessibilityLiveRegion="polite">
                  {saveError}
                </Text>
              </View>
            ) : null}
            {saved ? (
              <View style={styles.feedbackRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={theme.colors.success}
                  accessible={false}
                />
                <Text style={styles.feedbackOk} accessibilityLiveRegion="polite">
                  Palpite salvo!
                </Text>
              </View>
            ) : null}

            <Button
              title={prediction ? 'Atualizar palpite' : 'Salvar palpite'}
              onPress={onSave}
              loading={saving}
              icon="save-outline"
              style={styles.saveBtn}
            />
          </View>
        ) : (
          <View style={styles.lockedBox}>
            <Ionicons
              name="lock-closed"
              size={20}
              color={theme.colors.textSecondary}
              accessible={false}
            />
            <Text style={styles.lockedText}>
              Palpites encerrados para esta partida.
            </Text>
          </View>
        )}

        {/* Resultado do palpite (RF-024): só quando a partida terminou e há palpite. */}
        {isFinished && prediction ? (
          <View style={styles.resultBox}>
            <Text style={styles.predictionTitle}>Resultado do seu palpite</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Seu palpite</Text>
              <Text style={styles.resultValue}>
                {prediction.homeGuess} x {prediction.awayGuess}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Pontos obtidos</Text>
              <Text style={styles.resultPoints}>{prediction.points ?? 0}</Text>
            </View>
            {prediction.criterion ? (
              <View style={styles.criterionRow}>
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
                <Text style={styles.criterionText}>
                  {CRITERION_LABEL[prediction.criterion]}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minHeight: 48,
    alignSelf: 'flex-start',
  },
  backText: {
    ...theme.font.body,
    color: theme.colors.textPrimary,
  },
  metaBlock: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  phase: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
  },
  confronto: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  versus: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  predictionBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  predictionTitle: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
  },
  steppers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  versusSmall: {
    ...theme.font.h2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },
  saveBtn: {
    marginTop: theme.spacing.xs,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  feedbackError: {
    ...theme.font.label,
    color: theme.colors.danger,
  },
  feedbackOk: {
    ...theme.font.label,
    color: theme.colors.success,
  },
  lockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  lockedText: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  resultBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultLabel: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
  },
  resultValue: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
  },
  resultPoints: {
    ...theme.font.h2,
    color: theme.colors.accent,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  criterionText: {
    ...theme.font.body,
    color: theme.colors.textPrimary,
  },
});
