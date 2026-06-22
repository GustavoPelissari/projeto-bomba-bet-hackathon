import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../constants/theme';
import { getProfile } from '../../services/profileService';
import { listMatches } from '../../services/matchService';
import { firstName, formatLongDate } from '../../utils/format';
import type { Match, UserProfile } from '../../types/domain';
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';
import SectionHeader from '../../components/SectionHeader';
import MatchCard from '../../components/MatchCard';

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega perfil e partidas em paralelo.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, m] = await Promise.all([getProfile(), listMatches()]);
      setProfile(p);
      setMatches(m);
    } catch {
      setError('Não foi possível carregar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || error) {
    return (
      <ScreenContainer>
        <StateView loading={loading} error={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  // Próximas 5 partidas agendadas, da mais próxima para a mais distante.
  const now = Date.now();
  const upcoming = matches
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.datetime).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )
    .slice(0, 5);

  return (
    <ScreenContainer noPadding>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>
          Olá, {profile ? firstName(profile.name) : ''}!
        </Text>
        <Text style={styles.date}>{formatLongDate(new Date().toISOString())}</Text>

        <View style={styles.statsCard}>
          <View style={styles.statMain}>
            <Text style={styles.statLabel}>Seus pontos</Text>
            <Text style={styles.statPoints}>{profile?.totalPoints ?? 0}</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Posição</Text>
              <Text style={styles.statValue}>{profile?.rankingPosition}º</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Placares exatos</Text>
              <Text style={styles.statValue}>{profile?.exactScores}</Text>
            </View>
          </View>
        </View>

        <SectionHeader
          title="Próximas partidas"
          right={
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/matches')}
              accessibilityRole="link"
              accessibilityLabel="Ver todas as partidas"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.link}>Ver todas</Text>
            </TouchableOpacity>
          }
        />

        {upcoming.length === 0 ? (
          <StateView
            empty
            emptyIcon="calendar-outline"
            emptyMessage="Nenhuma partida aberta para palpite agora."
          />
        ) : (
          upcoming.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              onPress={() =>
                router.push({ pathname: '/match/[id]', params: { id: m.id } })
              }
            />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  greeting: {
    ...theme.font.h2,
    color: theme.colors.textPrimary,
  },
  date: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textTransform: 'capitalize',
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  statMain: {
    alignItems: 'center',
  },
  statPoints: {
    fontSize: 44,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border,
  },
  statLabel: {
    ...theme.font.label,
    color: theme.colors.textSecondary,
  },
  statValue: {
    ...theme.font.h2,
    color: theme.colors.textPrimary,
  },
  link: {
    ...theme.font.label,
    color: theme.colors.accent,
  },
});
