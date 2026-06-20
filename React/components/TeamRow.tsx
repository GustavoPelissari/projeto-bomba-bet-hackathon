import React from 'react'; // necessário para JSX
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';   // tokens de design
import type { Team } from '../types/domain';   // tipo do time

// Props da linha de time.
type Props = {
  team: Team;                 // dados do time (bandeira, nome, sigla)
  score?: number | null;      // placar (opcional); se ausente/null, não exibe
  /** Destaca a linha (ex.: vencedor ou seleção). */
  large?: boolean;            // versão maior (usada na tela de detalhes)
  highlight?: boolean;        // destaca o nome em dourado/negrito
};

// Linha que mostra bandeira + nome + sigla de um time, com placar opcional.
export default function TeamRow({ team, score, large, highlight }: Props) {
  return (
    <View
      style={styles.row}
      accessible
      // Leitura acessível: inclui o placar só quando ele existe.
      accessibilityLabel={
        score != null
          ? `${team.name}, ${score} gols`
          : team.name
      }
    >
      {/* Bandeira (emoji). accessible=false: já está no rótulo da linha. */}
      <Text
        style={[styles.flag, large && styles.flagLarge]}
        accessible={false}
      >
        {team.flag}
      </Text>
      <View style={styles.names}>
        <Text
          style={[
            styles.name,
            large && styles.nameLarge,     // fonte maior se "large"
            highlight && styles.highlight, // dourado/negrito se "highlight"
          ]}
          numberOfLines={1} // nome em 1 linha (trunca se for muito longo)
        >
          {team.name}
        </Text>
        <Text style={styles.code}>{team.fifaCode}</Text>{/* sigla FIFA, ex.: BRA */}
      </View>
      {score != null ? (
        // Placar à direita, só quando informado.
        <Text style={[styles.score, large && styles.scoreLarge]}>{score}</Text>
      ) : null}
    </View>
  );
}

// Estilos.
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',     // bandeira + nomes + placar na horizontal
    alignItems: 'center',
    gap: theme.spacing.md,    // espaço entre os elementos
  },
  flag: {
    fontSize: 24,             // tamanho normal da bandeira
  },
  flagLarge: {
    fontSize: 40,             // tamanho ampliado da bandeira
  },
  names: {
    flex: 1,                  // ocupa o espaço do meio (empurra o placar p/ a direita)
    flexDirection: 'row',     // nome + sigla lado a lado
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  name: {
    ...theme.font.body,
    color: theme.colors.textPrimary,
    flexShrink: 1,            // permite o nome encolher se faltar espaço
  },
  nameLarge: {
    ...theme.font.title,      // nome em tamanho de título
  },
  highlight: {
    color: theme.colors.accent, // dourado
    fontWeight: '700',          // negrito
  },
  code: {
    ...theme.font.caption,
    color: theme.colors.textSecondary,
  },
  score: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
    minWidth: 24,             // largura mínima para alinhar placares
    textAlign: 'center',
  },
  scoreLarge: {
    ...theme.font.h1,         // placar grande na tela de detalhes
  },
});
