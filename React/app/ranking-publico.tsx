import React, { useCallback, useEffect, useState } from 'react'; // React + hooks
import {
  ActivityIndicator, // spinner do rodapé (paginação)
  FlatList,          // lista performática
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';          // ícones
import { router } from 'expo-router';                    // navegação
import { theme } from '../constants/theme';              // tokens de design
import { getRanking } from '../services/rankingService'; // serviço de ranking (público)
import { initialOf } from '../utils/format';             // inicial do nome (avatar)
import type { RankingEntry } from '../types/domain';     // tipo de linha do ranking
import ScreenContainer from '../components/ScreenContainer';
import StateView from '../components/StateView';

// Quantidade de itens por página.
const PAGE_SIZE = 50;

// Avatar circular com a inicial do nome ("accent" = dourado p/ o 1º lugar).
function Avatar({ name, accent }: { name: string; accent?: boolean }) {
  return (
    <View style={[styles.avatar, accent && styles.avatarAccent]}>
      <Text style={[styles.avatarText, accent && styles.avatarTextAccent]}>
        {initialOf(name)}
      </Text>
    </View>
  );
}

// Tela de Ranking do VISITANTE (acesso público, sem login).
export default function RankingPublicoScreen() {
  const [items, setItems] = useState<RankingEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega a primeira página do ranking.
  const loadFirst = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const first = await getRanking(1, PAGE_SIZE);
      setItems(first.items);
      setTotal(first.total);
      setPage(1);
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
    if (loadingMore || loading || items.length >= total) return;
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

  // Barra superior com o botão "Voltar ao login".
  const TopBar = (
    <View style={styles.topBar}>
      <TouchableOpacity
        onPress={() => router.replace('/login')}
        accessibilityRole="button"
        accessibilityLabel="Voltar ao login"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        <Text style={styles.backText}>Voltar ao login</Text>
      </TouchableOpacity>
      <View style={styles.visitorTag}>
        <Ionicons name="eye-outline" size={13} color={theme.colors.textSecondary} />
        <Text style={styles.visitorTagText}>Visitante</Text>
      </View>
    </View>
  );

  if (loading || error) {
    return (
      <ScreenContainer noPadding>
        <View style={styles.topBarPad}>{TopBar}</View>
        <StateView loading={loading} error={error} onRetry={loadFirst} />
      </ScreenContainer>
    );
  }

  const podium = items.slice(0, 3);

  const renderItem = ({ item }: { item: RankingEntry }) => (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${item.position}º lugar, ${item.name}, ${item.totalPoints} pontos, ${item.exactScores} placares exatos`}
    >
      <Text style={styles.position}>{item.position}º</Text>
      <Avatar name={item.name} accent={item.position === 1} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowExact}>{item.exactScores} placares exatos</Text>
      </View>
      <Text style={styles.rowPoints}>{item.totalPoints}</Text>
    </View>
  );

  return (
    <ScreenContainer noPadding>
      <View style={styles.topBarPad}>{TopBar}</View>
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

            {/* Pódio (3 primeiros) */}
            <View style={styles.podium}>
              {podium.map((p) => (
                <View
                  key={p.userId}
                  style={[styles.podiumItem, p.position === 1 && styles.podiumFirst]}
                  accessible
                  accessibilityLabel={`${p.position}º lugar, ${p.name}, ${p.totalPoints} pontos`}
                >
                  <Text style={styles.podiumPos}>{p.position}º</Text>
                  <Avatar name={p.name} accent={p.position === 1} />
                  <Text style={styles.podiumName} numberOfLines={1}>{p.name}</Text>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBarPad: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minHeight: 44,
  },
  backText: {
    ...theme.font.body,
    color: theme.colors.textPrimary,
  },
  visitorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md - 2,
    paddingVertical: theme.spacing.xs,
  },
  visitorTagText: {
    ...theme.font.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  list: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
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
  position: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
    minWidth: 36,
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
});
