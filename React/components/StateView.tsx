import React from 'react'; // necessário para JSX
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ícones
import { theme } from '../constants/theme';     // tokens de design
import Button from './Button';                  // botão reutilizável (p/ "tentar novamente")

// Props que controlam qual estado exibir.
type Props = {
  loading?: boolean;                       // true = mostra carregando
  error?: string | null;                   // texto do erro (se houver)
  empty?: boolean;                         // true = lista vazia
  emptyMessage?: string;                   // mensagem quando vazio
  emptyIcon?: keyof typeof Ionicons.glyphMap; // ícone quando vazio
  loadingMessage?: string;                 // mensagem ao carregar
  onRetry?: () => void;                    // ação de tentar de novo / atualizar
};

/**
 * Renderiza os estados de carregando / erro / vazio.
 * Retorna null quando não há nenhum desses estados (sucesso com conteúdo).
 */
export default function StateView({
  loading,
  error,
  empty,
  emptyMessage = 'Nada por aqui ainda.',   // valor padrão da mensagem de vazio
  emptyIcon = 'file-tray-outline',         // ícone padrão de vazio
  loadingMessage = 'Carregando…',          // mensagem padrão de carregamento
  onRetry,
}: Props) {
  // 1º caso: está carregando -> mostra spinner + mensagem.
  if (loading) {
    return (
      <View style={styles.container} accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.message}>{loadingMessage}</Text>
      </View>
    );
  }

  // 2º caso: houve erro -> ícone, mensagem e (opcional) botão de tentar novamente.
  if (error) {
    return (
      <View style={styles.container}>
        <Ionicons
          name="cloud-offline-outline"
          size={40}
          color={theme.colors.danger}
          accessible={false}
        />
        {/* accessibilityLiveRegion="polite": leitor anuncia o erro quando ele aparece */}
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

  // 3º caso: lista vazia -> ícone, mensagem e (opcional) botão de atualizar.
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

  // Nenhum estado especial: devolve null (a tela mostra o conteúdo real).
  return null;
}

// Estilos.
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,                 // cresce para preencher o espaço disponível
    alignItems: 'center',        // centraliza horizontalmente
    justifyContent: 'center',    // centraliza verticalmente
    padding: theme.spacing.xl,
    gap: theme.spacing.md,       // espaço entre ícone, texto e botão
  },
  message: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: theme.spacing.sm, // espaço acima do botão
  },
});
