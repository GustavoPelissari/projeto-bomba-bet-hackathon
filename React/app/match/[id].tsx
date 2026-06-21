import React, { useCallback, useEffect, useState } from 'react'; // React + hooks
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';                 // ícones
// useLocalSearchParams lê os parâmetros da rota (o id da partida na URL).
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/theme';                 // tokens de design
import { getMatch } from '../../services/matchService';        // busca uma partida
import {
  getPredictionByMatch, // busca o palpite existente da partida
  savePrediction,       // salva/atualiza o palpite
} from '../../services/predictionService';
import { formatDate, phaseLabel } from '../../utils/format';   // helpers
import type { Match, Prediction, PredictionCriterion } from '../../types/domain';
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';
import StatusPill from '../../components/StatusPill';
import TeamRow from '../../components/TeamRow';
import ScoreStepper from '../../components/ScoreStepper';
import Button from '../../components/Button';

// Texto detalhado de cada critério, incluindo a pontuação.
const CRITERION_LABEL: Record<PredictionCriterion, string> = {
  EXACT: 'Placar exato (10 pts)',
  WINNER: 'Acertou o vencedor (5 pts)',
  MISS: 'Sem pontos (0)',
};

// Tela de detalhes de uma partida. O nome do arquivo [id] cria uma rota dinâmica.
export default function MatchDetailScreen() {
  // Lê o "id" da rota (vem como string) e converte para número.
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = Number(id);

  const [match, setMatch] = useState<Match | null>(null);            // a partida
  const [prediction, setPrediction] = useState<Prediction | null>(null); // palpite existente
  const [home, setHome] = useState(0);                              // placar palpitado mandante
  const [away, setAway] = useState(0);                              // placar palpitado visitante
  const [loading, setLoading] = useState(true);                    // carregando a tela?
  const [error, setError] = useState<string | null>(null);         // erro de carga?
  const [saving, setSaving] = useState(false);                     // salvando palpite?
  const [saveError, setSaveError] = useState<string | null>(null); // erro ao salvar?
  const [saved, setSaved] = useState(false);                       // mostrou "Palpite salvo!"?

  // Carrega a partida e o palpite atual (se houver).
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Busca partida e palpite em paralelo.
      const [m, p] = await Promise.all([
        getMatch(matchId),
        getPredictionByMatch(matchId),
      ]);
      setMatch(m);
      setPrediction(p);
      // Se já existe palpite, pré-preenche os steppers com os valores salvos.
      if (p) {
        setHome(p.homeGuess);
        setAway(p.awayGuess);
      }
    } catch {
      setError('Não foi possível carregar a partida. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [matchId]); // recria a função se o id mudar

  // Carrega os dados ao montar (ou quando "load" mudar por causa do id).
  useEffect(() => {
    load();
  }, [load]);

  // Salva (ou atualiza) o palpite.
  const onSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      // TODO POST/PUT /predictions
      const result = await savePrediction(matchId, home, away);
      setPrediction(result); // atualiza o palpite na tela
      setSaved(true);        // exibe a confirmação "Palpite salvo!"
    } catch (e) {
      // Usa a mensagem do erro, se for um Error; senão, um texto genérico.
      setSaveError(
        e instanceof Error ? e.message : 'Não foi possível salvar o palpite.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Cabeçalho com botão "Voltar" (reaproveitado nos estados de loading/erro e sucesso).
  const Header = (
    <TouchableOpacity
      onPress={() => router.back()} // volta à tela anterior
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.backBtn}
    >
      <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      <Text style={styles.backText}>Voltar</Text>
    </TouchableOpacity>
  );

  // Estado de carregamento/erro (ou partida ainda nula).
  if (loading || error || !match) {
    return (
      <ScreenContainer>
        {Header}
        <StateView loading={loading} error={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  // Atalhos para os estados da partida.
  const isScheduled = match.status === 'SCHEDULED'; // ainda dá p/ palpitar
  const isFinished = match.status === 'FINISHED';   // já terminou
  const showScore = !isScheduled;                   // mostra placar ao vivo e encerrada

  return (
    <ScreenContainer noPadding>
      <ScrollView contentContainerStyle={styles.scroll}>
        {Header}

        {/* Meta */}
        {/* Bloco de informações: situação, fase/grupo, estádio e data */}
        <View style={styles.metaBlock}>
          <StatusPill status={match.status} />
          <Text style={styles.phase}>
            {phaseLabel(match.phase)}
            {/* Mostra o grupo só se a partida tiver um (fases de grupos) */}
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

        {/* Confronto */}
        {/* Mandante x Visitante em tamanho grande (placar aparece ao vivo e encerrada) */}
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

        {/* Área de palpite */}
        {isScheduled ? (
          // Partida agendada: mostra os controles para palpitar.
          <View style={styles.predictionBox}>
            <Text style={styles.predictionTitle}>Seu palpite</Text>
            <View style={styles.steppers}>
              {/* Stepper do mandante (controla o estado "home") */}
              <ScoreStepper
                label={match.homeTeam.fifaCode}
                value={home}
                onChange={setHome}
                disabled={saving}
              />
              <Text style={styles.versusSmall}>x</Text>
              {/* Stepper do visitante (controla o estado "away") */}
              <ScoreStepper
                label={match.awayTeam.fifaCode}
                value={away}
                onChange={setAway}
                disabled={saving}
              />
            </View>

            {/* Mensagem de erro ao salvar, se houver */}
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
            {/* Mensagem de sucesso ao salvar, se aplicável */}
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

            {/* Botão muda o texto conforme já exista palpite ou não */}
            <Button
              title={prediction ? 'Atualizar palpite' : 'Salvar palpite'}
              onPress={onSave}
              loading={saving}
              icon="save-outline"
              style={styles.saveBtn}
            />
          </View>
        ) : (
          // Partida ao vivo ou encerrada: palpites bloqueados.
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

        {/* Resultado do palpite (RF-024) */}
        {/* Só aparece quando a partida terminou E existe um palpite */}
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
            {/* Critério de pontuação, com ícone verde/vermelho */}
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

// Estilos.
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
    alignSelf: 'flex-start', // ocupa só a largura do conteúdo
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
    flexDirection: 'row',     // dois steppers + "x" no centro
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  versusSmall: {
    ...theme.font.h2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg, // alinha o "x" com os números dos steppers
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
    borderColor: theme.colors.accent, // destaque dourado no resultado
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
