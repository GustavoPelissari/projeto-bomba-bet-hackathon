import React, { useCallback, useEffect, useMemo, useState } from 'react'; // React + hooks
import {
  ScrollView,        // rolagem (usada nos filtros horizontais)
  SectionList,       // lista dividida em seções (por fase)
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';                  // navegação imperativa
import { theme } from '../../constants/theme';         // tokens de design
import { listMatches } from '../../services/matchService'; // busca partidas
import { phaseLabel } from '../../utils/format';       // traduz a fase p/ português
import type { Match, MatchStatus, Phase } from '../../types/domain'; // tipos
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';
import MatchCard from '../../components/MatchCard';

// Tipos dos filtros: aceitam 'ALL' (todos) ou um valor específico.
type PhaseFilter = 'ALL' | Phase;
type StatusFilter = 'ALL' | MatchStatus;

// Botões (chips) de filtro por FASE: cada um tem uma chave e um rótulo.
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

// Chips de filtro por SITUAÇÃO.
const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'SCHEDULED', label: 'Agendada' },
  { key: 'LIVE', label: 'Ao vivo' },
  { key: 'FINISHED', label: 'Encerrada' },
];

// Ordem em que as seções (fases) aparecem na lista.
const PHASE_ORDER: Phase[] = ['GROUP', 'ROUND_32', 'ROUND_16', 'QUARTER', 'SEMI', 'THIRD', 'FINAL'];

// Componente de um "chip" (botão de filtro arredondado).
function Chip({
  label,     // texto do chip
  selected,  // se está selecionado (muda a cor)
  onPress,   // ação ao tocar
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
      accessibilityState={{ selected }} // informa ao leitor de tela se está selecionado
      hitSlop={{ top: 6, bottom: 6 }}   // amplia a área tocável
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Tela de listagem de partidas (aba "Partidas").
export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);          // todas as partidas
  const [loading, setLoading] = useState(true);                // carregando?
  const [error, setError] = useState<string | null>(null);     // erro?
  const [phase, setPhase] = useState<PhaseFilter>('ALL');      // filtro de fase atual
  const [status, setStatus] = useState<StatusFilter>('ALL');   // filtro de situação atual
  const [date, setDate] = useState<string>('ALL');            // filtro de data (yyyy-mm-dd) ou 'ALL'

  // Carrega as partidas do serviço.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMatches(await listMatches());
    } catch {
      setError('Não foi possível carregar as partidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Roda "load" ao montar a tela.
  useEffect(() => {
    load();
  }, [load]);

  // Datas disponíveis (extraídas das partidas) para o filtro por data.
  // Cada partida vira o dia "yyyy-mm-dd"; mantemos os dias únicos, ordenados.
  const dateChips = useMemo(() => {
    const dias = Array.from(
      new Set(matches.map((m) => m.datetime.slice(0, 10)))
    ).sort();
    return [
      { key: 'ALL', label: 'Todas' },
      ...dias.map((d) => {
        const [, mes, dia] = d.split('-'); // "yyyy-mm-dd" -> dd/mm
        return { key: d, label: `${dia}/${mes}` };
      }),
    ];
  }, [matches]);

  // Monta as seções da lista. useMemo recalcula só quando partidas/filtros mudam
  // (evita refazer esse trabalho a cada render).
  const sections = useMemo(() => {
    // 1) Aplica os filtros de fase, status e data.
    const filtered = matches.filter((m) => {
      if (phase !== 'ALL' && m.phase !== phase) return false;
      if (status !== 'ALL' && m.status !== status) return false;
      if (date !== 'ALL' && !m.datetime.startsWith(date)) return false;
      return true;
    });

    // 2) Para cada fase (na ordem definida), cria uma seção com suas partidas ordenadas.
    return PHASE_ORDER.map((p) => ({
      title: phaseLabel(p), // título exibido (ex.: "Fase de Grupos")
      phase: p,
      data: filtered
        .filter((m) => m.phase === p)               // só as partidas desta fase
        .sort(                                        // ordenadas por data crescente
          (a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        ),
    })).filter((s) => s.data.length > 0); // remove seções vazias
  }, [matches, phase, status, date]);

  // Bloco reutilizável dos filtros (duas linhas roláveis de chips).
  const Filters = (
    <View style={styles.filters}>
      {/* Linha de filtros por fase (rolagem horizontal) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {PHASE_CHIPS.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            selected={phase === c.key}        // marca o chip ativo
            onPress={() => setPhase(c.key)}   // troca o filtro de fase
          />
        ))}
      </ScrollView>
      {/* Linha de filtros por situação (rolagem horizontal) */}
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
      {/* Linha de filtros por data (gerada a partir das partidas) */}
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

  // Durante carregamento/erro, mostra os filtros + o StateView.
  if (loading || error) {
    return (
      <ScreenContainer>
        {Filters}
        <StateView loading={loading} error={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noPadding>
      <View style={styles.headerPad}>{Filters}</View>
      {/* SectionList renderiza listas agrupadas por seção de forma performática. */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)} // chave única de cada partida
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}       // cabeçalhos não "grudam" no topo ao rolar
        renderSectionHeader={({ section }) => (    // como desenhar o título de cada seção
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (                // como desenhar cada partida
          <MatchCard
            match={item}
            onPress={() =>
              router.push({ pathname: '/match/[id]', params: { id: item.id } })
            }
          />
        )}
        ListEmptyComponent={                       // exibido quando não há resultados
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

// Estilos.
const styles = StyleSheet.create({
  headerPad: {
    paddingTop: theme.spacing.lg,
  },
  filters: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  chipRow: {
    gap: theme.spacing.sm,                 // espaço entre chips
    paddingHorizontal: theme.spacing.lg,
  },
  chip: {
    minHeight: 44,                         // altura confortável p/ toque
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,       // formato de pílula
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: theme.colors.accent,  // dourado quando selecionado
    borderColor: theme.colors.accent,
  },
  chipText: {
    ...theme.font.label,
    color: theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: theme.colors.accentText,        // texto escuro sobre o dourado
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
