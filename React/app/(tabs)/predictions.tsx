import React, { useCallback, useState } from 'react'; // React + hooks
import {
  FlatList,          // lista performática (renderiza só o que está visível)
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';                 // ícones
import { router, useFocusEffect } from 'expo-router';          // navegação + efeito ao focar a aba
import { theme } from '../../constants/theme';                 // tokens de design
import { listMyPredictions } from '../../services/predictionService'; // busca palpites
import { listMatches } from '../../services/matchService';     // busca partidas
import type { Match, Prediction, PredictionCriterion } from '../../types/domain';
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';
import TeamRow from '../../components/TeamRow';

// Texto curto exibido para cada critério de pontuação.
const CRITERION_SHORT: Record<PredictionCriterion, string> = {
  EXACT: 'Placar exato',
  WINNER: 'Acertou o vencedor',
  MISS: 'Sem pontos',
};

// Cada item da lista junta um palpite com a partida correspondente.
type Item = { prediction: Prediction; match: Match };

// Tela "Meus Palpites" (aba Palpites).
export default function PredictionsScreen() {
  const [items, setItems] = useState<Item[]>([]);            // palpites + partidas combinados
  const [totalPoints, setTotalPoints] = useState(0);        // soma de pontos
  const [loading, setLoading] = useState(true);             // carregando?
  const [error, setError] = useState<string | null>(null);  // erro?

  // Carrega palpites e partidas e os combina.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Busca palpites e partidas em paralelo.
      const [preds, matches] = await Promise.all([
        listMyPredictions(),
        listMatches(),
      ]);
      // Cria um Map id->partida para localizar a partida de cada palpite rapidamente.
      const byId = new Map(matches.map((m) => [m.id, m]));
      const joined: Item[] = preds
        // Para cada palpite, anexa sua partida (ou null se não achar).
        .map((p) => {
          const match = byId.get(p.matchId);
          return match ? { prediction: p, match } : null;
        })
        // Remove os nulos. O "(x): x is Item" diz ao TS que sobraram só Items.
        .filter((x): x is Item => x !== null)
        // Ordena do jogo mais recente para o mais antigo (data decrescente).
        .sort(
          (a, b) =>
            new Date(b.match.datetime).getTime() -
            new Date(a.match.datetime).getTime()
        );
      setItems(joined);
      // Soma os pontos de todos os palpites (reduce acumula; "?? 0" trata null).
      setTotalPoints(
        preds.reduce((sum, p) => sum + (p.points ?? 0), 0)
      );
    } catch {
      setError('Não foi possível carregar seus palpites. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // recarrega ao focar a aba
  // useFocusEffect roda toda vez que a aba volta a ficar visível (não só ao montar).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Tela de carregamento/erro.
  if (loading || error) {
    return (
      <ScreenContainer>
        <StateView loading={loading} error={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  // Função que desenha um cartão de palpite. Recebe um Item da lista.
  const renderItem = ({ item }: { item: Item }) => {
    const { prediction, match } = item;            // desestrutura o item
    const finished = match.status === 'FINISHED';  // a partida já terminou?

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
        {/* Times da partida */}
        <View style={styles.teams}>
          <TeamRow team={match.homeTeam} />
          <TeamRow team={match.awayTeam} />
        </View>

        <View style={styles.divider} />{/* linha divisória */}

        {/* Linha com o palpite do usuário */}
        <View style={styles.guessRow}>
          <Text style={styles.guessLabel}>Seu palpite</Text>
          <Text style={styles.guessValue}>
            {prediction.homeGuess} x {prediction.awayGuess}
          </Text>
        </View>

        {finished ? (
          // Se a partida terminou: mostra resultado real + critério + pontos.
          <>
            <View style={styles.guessRow}>
              <Text style={styles.guessLabel}>Resultado</Text>
              <Text style={styles.guessValue}>
                {match.homeScore} x {match.awayScore}
              </Text>
            </View>
            <View style={styles.statusRow}>
              {/* Ícone vermelho (X) se errou, verde (check) caso contrário */}
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
                {/* Texto do critério, ou "Aguardando" se ainda não apurado */}
                {prediction.criterion
                  ? CRITERION_SHORT[prediction.criterion]
                  : 'Aguardando'}
              </Text>
              <View style={styles.spacer} />{/* empurra os pontos p/ a direita */}
              <Text style={styles.points}>{prediction.points ?? 0} pts</Text>
            </View>
          </>
        ) : (
          // Se ainda não terminou: apenas "Aguardando".
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
        data={items}                                          // dados da lista
        keyExtractor={(item) => String(item.prediction.id)}  // chave única por palpite
        contentContainerStyle={styles.list}
        renderItem={renderItem}                              // como desenhar cada item
        ListHeaderComponent={                                // cabeçalho fixo no topo da lista
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Meus Palpites
            </Text>
            <Text style={styles.subtitle}>
              {/* Quantidade (com singular/plural) e total de pontos */}
              {items.length}{' '}
              {items.length === 1 ? 'palpite' : 'palpites'} · {totalPoints} pts
            </Text>
          </View>
        }
        ListEmptyComponent={                                 // exibido quando não há palpites
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

// Estilos.
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
    height: 1,                                  // linha fina horizontal
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  guessRow: {
    flexDirection: 'row',                       // rótulo à esquerda, valor à direita
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
    flex: 1,                                    // ocupa o espaço livre (empurra os pontos)
  },
  points: {
    ...theme.font.title,
    color: theme.colors.accent,                 // pontos em dourado
  },
});
