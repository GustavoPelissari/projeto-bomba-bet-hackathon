import { StyleSheet, Text, View } from 'react-native'; // componentes básicos
import { theme } from '../../constants/theme';          // tokens de design
import { useAuth } from '../../contexts/AuthContext';   // dados do usuário logado

// Aba "Início" — primeira tela após o login.
export default function HomeScreen() {
  const { user } = useAuth(); // usuário logado (vem do AuthContext)

  return (
    <View style={styles.container}>
      {/* Saudação com o nome do usuário. */}
      <Text style={styles.hello}>Olá, {user?.name ?? 'jogador'}! 👋</Text>
      <Text style={styles.subtitle}>Bem-vindo ao Bomba Bet.</Text>

      {/* Cartão simples mostrando a conta logada. */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Logado como</Text>
        <Text style={styles.cardValue}>{user?.email ?? '—'}</Text>
      </View>

      <Text style={styles.note}>
        Esta é a tela inicial. A partir das abas abaixo você pode criar novas
        telas (Partidas, Palpites, Ranking...).
      </Text>
    </View>
  );
}

// Estilos.
const styles = StyleSheet.create({
  container: {
    flex: 1,                          // ocupa a tela inteira
    backgroundColor: theme.colors.bg, // fundo escuro
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + theme.spacing.lg, // espaço p/ a barra de status
    gap: theme.spacing.md,            // espaço entre os blocos
  },
  hello: {
    ...theme.font.h1,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  cardLabel: {
    ...theme.font.label,
    color: theme.colors.textSecondary,
  },
  cardValue: {
    ...theme.font.title,
    color: theme.colors.accent, // e-mail em dourado
  },
  note: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});
