import React, { useCallback, useState } from 'react'; // React + hooks
import {
  Alert,             // caixa de diálogo nativa (confirmações)
  Image,             // exibe a foto de perfil (quando for URL)
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';                 // ícones
import { router, useFocusEffect } from 'expo-router';          // navegação + efeito ao focar
import { theme } from '../../constants/theme';                 // tokens de design
import { getProfile, deleteAccount } from '../../services/profileService'; // serviços de perfil
import { useAuth } from '../../contexts/AuthContext';          // hook de autenticação (logout)
import { initialOf } from '../../utils/format';                // inicial do nome (avatar)
import type { UserProfile } from '../../types/domain';         // tipo do perfil
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';

// Formato de uma ação da lista (editar, sair, excluir).
type Action = {
  key: string;                            // chave única (p/ a lista)
  icon: keyof typeof Ionicons.glyphMap;   // ícone
  label: string;                          // texto
  danger?: boolean;                       // se true, exibe em vermelho
  onPress: () => void;                    // ação ao tocar
};

// Tela de perfil (aba Perfil).
export default function ProfileScreen() {
  const { logout } = useAuth();                              // função de logout
  const [profile, setProfile] = useState<UserProfile | null>(null); // perfil carregado
  const [loading, setLoading] = useState(true);             // carregando?
  const [error, setError] = useState<string | null>(null);  // erro?

  // Carrega o perfil do serviço.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await getProfile());
    } catch {
      setError('Não foi possível carregar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega o perfil sempre que a aba ganha foco (reflete edições feitas em outra tela).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Confirmação de logout via diálogo nativo.
  const onLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' }, // botão que só fecha o diálogo
      {
        text: 'Sair',
        style: 'destructive', // exibe em vermelho (iOS)
        onPress: async () => {
          await logout();             // limpa a sessão
          router.replace('/login');   // volta para o login (sem poder voltar)
        },
      },
    ]);
  };

  // Confirmação de exclusão de conta via diálogo nativo.
  const onDelete = () => {
    Alert.alert(
      'Excluir conta',
      'Esta ação é permanente e remove seus dados. Confirmar exclusão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO DELETE /me
              await deleteAccount();      // exclui a conta (mock)
              await logout();             // encerra a sessão
              router.replace('/login');   // volta ao login
            } catch {
              // Em caso de falha, avisa o usuário.
              Alert.alert('Erro', 'Não foi possível excluir a conta.');
            }
          },
        },
      ]
    );
  };

  // Enquanto carrega, há erro, ou o perfil ainda é nulo, mostra o StateView.
  if (loading || error || !profile) {
    return (
      <ScreenContainer>
        <StateView loading={loading} error={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  // Lista de ações exibidas no fim da tela.
  const actions: Action[] = [
    {
      key: 'edit',
      icon: 'create-outline',
      label: 'Editar perfil',
      onPress: () => router.push('/profile/edit'), // abre a tela de edição
    },
    {
      key: 'logout',
      icon: 'log-out-outline',
      label: 'Sair',
      onPress: onLogout,
    },
    {
      key: 'delete',
      icon: 'trash-outline',
      label: 'Excluir conta',
      danger: true, // estilo de perigo (vermelho)
      onPress: onDelete,
    },
  ];

  return (
    <ScreenContainer noPadding>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cabeçalho do usuário */}
        {/* Avatar (inicial), nome e e-mail */}
        <View style={styles.head}>
          {profile.avatar ? (
            // Tem foto (URL) -> exibe a imagem.
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
              accessibilityLabel="Foto de perfil"
            />
          ) : (
            // Sem foto -> mostra a inicial do nome.
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialOf(profile.name)}</Text>
            </View>
          )}
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        {/* Estatísticas */}
        {/* Três métricas: pontos, posição e placares exatos */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.totalPoints}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValuePlain}>{profile.rankingPosition}º</Text>
            <Text style={styles.statLabel}>Posição</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValuePlain}>{profile.exactScores}</Text>
            <Text style={styles.statLabel}>Placares exatos</Text>
          </View>
        </View>

        {/* Ações */}
        {/* Renderiza cada ação como uma linha tocável */}
        <View style={styles.actions}>
          {actions.map((a) => (
            <TouchableOpacity
              key={a.key}
              onPress={a.onPress}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              style={styles.actionRow}
            >
              <Ionicons
                name={a.icon}
                size={22}
                // vermelho se for ação de perigo, branco caso contrário
                color={a.danger ? theme.colors.danger : theme.colors.textPrimary}
                accessible={false}
              />
              <Text
                style={[styles.actionLabel, a.danger && styles.actionDanger]}
              >
                {a.label}
              </Text>
              <Ionicons
                name="chevron-forward" // seta indicando que abre outra tela/ação
                size={20}
                color={theme.colors.textSecondary}
                accessible={false}
              />
            </TouchableOpacity>
          ))}
        </View>
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
  head: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,         // círculo
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  name: {
    ...theme.font.h2,
    color: theme.colors.textPrimary,
  },
  email: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',                    // três métricas lado a lado
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statDivider: {
    width: 1,                                // divisória vertical entre métricas
    height: 40,
    backgroundColor: theme.colors.border,
  },
  statValue: {
    ...theme.font.h2,
    color: theme.colors.accent,              // pontos em dourado
  },
  statValuePlain: {
    ...theme.font.h2,
    color: theme.colors.textPrimary,         // demais valores em branco
  },
  statLabel: {
    ...theme.font.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 56,                           // altura confortável p/ toque
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
  },
  actionLabel: {
    ...theme.font.body,
    color: theme.colors.textPrimary,
    flex: 1,                                 // empurra a seta p/ a direita
  },
  actionDanger: {
    color: theme.colors.danger,             // texto vermelho p/ ações perigosas
  },
});
