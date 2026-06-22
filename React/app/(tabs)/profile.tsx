import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { theme } from '../../constants/theme';
import { getProfile, deleteAccount } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { initialOf } from '../../utils/format';
import type { UserProfile } from '../../types/domain';
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';

type Action = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  danger?: boolean;
  onPress: () => void;
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Recarrega sempre que a aba ganha foco (reflete edições feitas em outra tela).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

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
              await deleteAccount();
              await logout();
              router.replace('/login');
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a conta.');
            }
          },
        },
      ]
    );
  };

  if (loading || error || !profile) {
    return (
      <ScreenContainer>
        <StateView loading={loading} error={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  const actions: Action[] = [
    {
      key: 'edit',
      icon: 'create-outline',
      label: 'Editar perfil',
      onPress: () => router.push('/profile/edit'),
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
      danger: true,
      onPress: onDelete,
    },
  ];

  return (
    <ScreenContainer noPadding>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          {profile.avatar ? (
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
              accessibilityLabel="Foto de perfil"
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialOf(profile.name)}</Text>
            </View>
          )}
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
        </View>

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
                color={a.danger ? theme.colors.danger : theme.colors.textPrimary}
                accessible={false}
              />
              <Text
                style={[styles.actionLabel, a.danger && styles.actionDanger]}
              >
                {a.label}
              </Text>
              <Ionicons
                name="chevron-forward"
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
    borderRadius: theme.radius.full,
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
    flexDirection: 'row',
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
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  statValue: {
    ...theme.font.h2,
    color: theme.colors.accent,
  },
  statValuePlain: {
    ...theme.font.h2,
    color: theme.colors.textPrimary,
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
    minHeight: 56,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
  },
  actionLabel: {
    ...theme.font.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  actionDanger: {
    color: theme.colors.danger,
  },
});
