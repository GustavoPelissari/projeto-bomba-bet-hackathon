import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { theme } from '../../constants/theme';
import { listMatches } from '../../services/matchService';
import { phaseLabel } from '../../utils/format';
import type { Match, MatchStatus, Phase } from '../../types/domain';
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';
import MatchCard from '../../components/MatchCard';

type PhaseFilter = 'ALL' | Phase;
type StatusFilter = 'ALL' | MatchStatus;

const PHASE_CHIPS: { key: PhaseFilter; label: string }[] = [
  { key: 'ALL', label: 'Todas' },
  { key: 'GROUP', label: 'Grupos' },
  { key: 'ROUND_32', label: '16-avos' },
  { key: 'ROUND_16', label: 'Oitavas' },
  { key: 'QUARTER', label: 'Quartas' },
  { key: 'SEMI', label: 'Semi' },
  { key: 'THIRD', label: '3º lugar' },
  { key: 'FINAL', label: 'Final' },
];

const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'SCHEDULED', label: 'Agendada' },
  { key: 'LIVE', label: 'Ao vivo' },
  { key: 'FINISHED', label: 'Encerrada' },
];

const PHASE_ORDER: Phase[] = ['GROUP', 'ROUND_32', 'ROUND_16', 'QUARTER', 'SEMI', 'THIRD', 'FINAL'];

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por ${label}`}
      accessibilityState={{ selected }}
      hitSlop={{ top: 6, bottom: 6 }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<PhaseFilter>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [date, setDate] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const jaCarregou = useRef(false);

  // Busca as partidas. "modo" define o indicador exibido (tela cheia, refresh ou silencioso).
  const carregar = useCallback(
    async (modo: 'inicial' | 'refresh' | 'silencioso' = 'inicial') => {
      if (modo === 'inicial') setLoading(true);
      if (modo === 'refresh') setRefreshing(true);
      if (modo !== 'silencioso') setError(null);
      try {
        setMatches(await listMatches());
      } catch {
        if (modo === 'inicial') {
          setError('Não foi possível carregar as partidas. Tente novamente.');
        }
      } finally {
        if (modo === 'inicial') setLoading(false);
        if (modo === 'refresh') setRefreshing(false);
      }
    },
    []
  );

  // Recarrega ao abrir a aba e a cada 20s para refletir mudanças do painel admin.
  useFocusEffect(
    useCallback(() => {
      carregar(jaCarregou.current ? 'silencioso' : 'inicial');
      jaCarregou.current = true;
      const timer = setInterval(() => carregar('silencioso'), 20000);
      return () => clearInterval(timer);
    }, [carregar])
  );

  // Dias únicos (extraídos das partidas) para o filtro por data.
  const dateChips = useMemo(() => {
    const dias = Array.from(
      new Set(matches.map((m) => m.datetime.slice(0, 10)))
    ).sort();
    return [
      { key: 'ALL', label: 'Todas' },
      ...dias.map((d) => {
        const [, mes, dia] = d.split('-');
        return { key: d, label: `${dia}/${mes}` };
      }),
    ];
  }, [matches]);

  // Aplica os filtros e agrupa as partidas em seções por fase.
  const sections = useMemo(() => {
    const filtered = matches.filter((m) => {
      if (phase !== 'ALL' && m.phase !== phase) return false;
      if (status !== 'ALL' && m.status !== status) return false;
      if (date !== 'ALL' && !m.datetime.startsWith(date)) return false;
      return true;
    });

    return PHASE_ORDER.map((p) => ({
      title: phaseLabel(p),
      phase: p,
      data: filtered
        .filter((m) => m.phase === p)
        .sort(
          (a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        ),
    })).filter((s) => s.data.length > 0);
  }, [matches, phase, status, date]);

  const Filters = (
    <View style={styles.filters}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {PHASE_CHIPS.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            selected={phase === c.key}
            onPress={() => setPhase(c.key)}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {STATUS_CHIPS.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            selected={status === c.key}
            onPress={() => setStatus(c.key)}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {dateChips.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            selected={date === c.key}
            onPress={() => setDate(c.key)}
          />
        ))}
      </ScrollView>
    </View>
  );

  if (loading || error) {
    return (
      <ScreenContainer>
        {Filters}
        <StateView loading={loading} error={error} onRetry={() => carregar('inicial')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noPadding>
      <View style={styles.headerPad}>{Filters}</View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => carregar('refresh')}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() =>
              router.push({ pathname: '/match/[id]', params: { id: item.id } })
            }
          />
        )}
        ListEmptyComponent={
          <StateView
            empty
            emptyIcon="filter-outline"
            emptyMessage="Nenhuma partida encontrada para esses filtros."
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingTop: theme.spacing.lg,
  },
  filters: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  chipRow: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipText: {
    ...theme.font.label,
    color: theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: theme.colors.accentText,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
});
