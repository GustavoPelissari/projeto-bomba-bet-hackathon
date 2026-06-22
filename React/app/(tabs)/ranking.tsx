import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { getRanking, getMyRankingEntry } from '../../services/rankingService';
import { useAuth } from '../../contexts/AuthContext';
import { initialOf } from '../../utils/format';
import type { RankingEntry } from '../../types/domain';
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';

const PAGE_SIZE = 50;

function Avatar({ name, accent }: { name: string; accent?: boolean }) {
  return (
    <View style={[styles.avatar, accent && styles.avatarAccent]}>
      <Text style={[styles.avatarText, accent && styles.avatarTextAccent]}>
        {initialOf(name)}
      </Text>
    </View>
  );
}

export default function RankingScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<RankingEntry[]>([]);
  const [me, setMe] = useState<RankingEntry | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega a primeira página e a posição do próprio usuário.
  const loadFirst = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [first, myEntry] = await Promise.all([
        getRanking(1, PAGE_SIZE),
        getMyRankingEntry(),
      ]);
      setItems(first.items);
      setTotal(first.total);
      setPage(1);
      setMe(myEntry);
    } catch {
      setError('Não foi possível carregar o ranking. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  // Carrega a próxima página ao rolar até perto do fim.
  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return;
    if (items.length >= total) return;
    setLoadingMore(true);
    try {
      const next = await getRanking(page + 1, PAGE_SIZE);
      setItems((prev) => [...prev, ...next.items]);
      setPage((p) => p + 1);
    } catch {
      // erro de página silencioso
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, items.length, total, page]);

  if (loading || error) {
    return (
      <ScreenContainer>
        <StateView loading={loading} error={error} onRetry={loadFirst} />
      </ScreenContainer>
    );
  }

  const podium = items.slice(0, 3);

  const renderItem = ({ item }: { item: RankingEntry }) => {
    const isMe = item.userId === user?.id;
    return (
      <View
        style={[styles.row, isMe && styles.rowMe]}
        accessible
        accessibilityLabel={`${item.position}º lugar, ${item.name}${
          isMe ? ' (você)' : ''
        }, ${item.totalPoints} pontos, ${item.exactScores} placares exatos`}
      >
        <Text style={[styles.position, isMe && styles.accentText]}>
          {item.position}º
        </Text>
        <Avatar name={item.name} accent={isMe} />
        <View style={styles.rowInfo}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.name}
            {isMe ? ' (você)' : ''}
          </Text>
          <Text style={styles.rowExact}>
            {item.exactScores} placares exatos
          </Text>
        </View>
        <Text style={styles.rowPoints}>{item.totalPoints}</Text>
      </View>
    );
  };

  return (
    <ScreenContainer noPadding>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.userId)}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListHeaderComponent={
          <View>
            <Text style={styles.title} accessibilityRole="header">
              Ranking Geral
            </Text>
            <Text style={styles.criteria}>
              Por pontos · desempate por placares exatos
            </Text>

            <View style={styles.podium}>
              {podium.map((p) => (
                <View
                  key={p.userId}
                  style={[
                    styles.podiumItem,
                    p.position === 1 && styles.podiumFirst,
                  ]}
                  accessible
                  accessibilityLabel={`${p.position}º lugar, ${p.name}, ${p.totalPoints} pontos`}
                >
                  <Text style={styles.podiumPos}>{p.position}º</Text>
                  <Avatar name={p.name} accent={p.position === 1} />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.podiumPoints}>{p.totalPoints} pts</Text>
                </View>
              ))}
            </View>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={theme.colors.accent} />
            </View>
          ) : null
        }
      />

      {/* Barra fixa com a posição do usuário (RF-033). */}
      {me ? (
        <View
          style={styles.stickyBar}
          accessible
          accessibilityLabel={`Sua posição: ${me.position}º lugar com ${me.totalPoints} pontos`}
        >
          <Ionicons
            name="person-circle"
            size={22}
            color={theme.colors.accent}
            accessible={false}
          />
          <Text style={styles.stickyText}>
            Sua posição: {me.position}ª · {me.totalPoints} pts
          </Text>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.lg,
    paddingBottom: 96,
  },
  title: {
    ...theme.font.h1,
    color: theme.colors.textPrimary,
  },
  criteria: {
    ...theme.font.label,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  podiumItem: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  podiumFirst: {
    borderColor: theme.colors.accent,
  },
  podiumPos: {
    ...theme.font.title,
    color: theme.colors.accent,
  },
  podiumName: {
    ...theme.font.caption,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  podiumPoints: {
    ...theme.font.caption,
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  rowMe: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surfaceAlt,
  },
  position: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
    minWidth: 36,
  },
  accentText: {
    color: theme.colors.accent,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    ...theme.font.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  rowExact: {
    ...theme.font.caption,
    color: theme.colors.textSecondary,
  },
  rowPoints: {
    ...theme.font.title,
    color: theme.colors.accent,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarAccent: {
    borderColor: theme.colors.accent,
  },
  avatarText: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
  },
  avatarTextAccent: {
    color: theme.colors.accent,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
  },
  stickyBar: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  stickyDot: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent,
  },
  stickyText: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
  },
});
