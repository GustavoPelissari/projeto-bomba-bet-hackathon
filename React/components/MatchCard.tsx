import React from 'react'; // necessário para JSX
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';      // ícones
import { theme } from '../constants/theme';         // tokens de design
import type { Match } from '../types/domain';       // tipo da partida
import { formatDate } from '../utils/format';       // formata data ISO -> pt-BR
import StatusPill from './StatusPill';              // etiqueta de situação
import TeamRow from './TeamRow';                    // linha de time (bandeira/nome/placar)

// Props do cartão de partida.
type Props = {
  match: Match;          // dados da partida a exibir
  onPress?: () => void;  // ação ao tocar no cartão (ex.: abrir detalhes)
};

// Cartão que resume uma partida (usado nas listas).
export default function MatchCard({ match, onPress }: Props) {
  // Só mostra placar se a partida NÃO estiver apenas agendada (ao vivo ou encerrada).
  const showScore = match.status !== 'SCHEDULED';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      // Rótulo completo lido pelo leitor de tela (times, data e estádio).
      accessibilityLabel={`${match.homeTeam.name} contra ${match.awayTeam.name}, ${formatDate(
        match.datetime
      )}, ${match.stadium}`}
      accessibilityHint="Abre os detalhes da partida"
      style={styles.card}
    >
      {/* Cabeçalho: data à esquerda, situação (pílula) à direita */}
      <View style={styles.header}>
        <View style={styles.meta}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={theme.colors.textSecondary}
            accessible={false}
          />
          <Text style={styles.metaText}>{formatDate(match.datetime)}</Text>{/* data formatada */}
        </View>
        <StatusPill status={match.status} />{/* etiqueta de situação */}
      </View>

      {/* Linha do estádio (ícone de local + nome) */}
      <View style={styles.stadiumRow}>
        <Ionicons
          name="location-outline"
          size={13}
          color={theme.colors.textSecondary}
          accessible={false}
        />
        <Text style={styles.metaText} numberOfLines={1}>{/* trunca em 1 linha se for longo */}
          {match.stadium}
        </Text>
      </View>

      {/* Times: mandante e visitante, com placar somente quando aplicável */}
      <View style={styles.teams}>
        <TeamRow
          team={match.homeTeam}
          score={showScore ? match.homeScore : undefined} // undefined = não exibe placar
        />
        <TeamRow
          team={match.awayTeam}
          score={showScore ? match.awayScore : undefined}
        />
      </View>
    </TouchableOpacity>
  );
}

// Estilos.
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,  // fundo do cartão
    borderWidth: 1,                         // borda fina
    borderColor: theme.colors.border,       // cor da borda
    borderRadius: theme.radius.lg,          // cantos arredondados
    padding: theme.spacing.lg,              // espaço interno
    marginBottom: theme.spacing.md,         // espaço entre cartões
    gap: theme.spacing.sm,                  // espaço entre os blocos internos
  },
  header: {
    flexDirection: 'row',                   // data e pílula na mesma linha
    alignItems: 'center',
    justifyContent: 'space-between',        // empurra um para cada ponta
  },
  meta: {
    flexDirection: 'row',                   // ícone + data lado a lado
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  stadiumRow: {
    flexDirection: 'row',                   // ícone + nome do estádio lado a lado
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    ...theme.font.caption,                  // texto pequeno
    color: theme.colors.textSecondary,      // cinza
    flexShrink: 1,                          // permite encolher se faltar espaço
  },
  teams: {
    marginTop: theme.spacing.sm,            // espaço acima do bloco de times
    gap: theme.spacing.md,                  // espaço entre as duas linhas de time
  },
});
