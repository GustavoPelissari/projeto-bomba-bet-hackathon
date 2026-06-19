import React, { useCallback, useEffect, useState } from 'react'; // React + hooks
import {
  ActivityIndicator,  // spinner (rodapé ao carregar mais páginas)
  FlatList,           // lista performática
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';                  // ícones
import { theme } from '../../constants/theme';                  // tokens de design
import { getRanking, getMyRankingEntry } from '../../services/rankingService'; // serviços de ranking
import { CURRENT_USER_ID } from '../../mocks/user';             // id do usuário logado
import { initialOf } from '../../utils/format';                 // pega a inicial do nome
import type { RankingEntry } from '../../types/domain';         // tipo de linha do ranking
import ScreenContainer from '../../components/ScreenContainer';
import StateView from '../../components/StateView';

// Quantidade de itens carregados por página (paginação).
const PAGE_SIZE = 50;

// Avatar circular com a inicial do nome. "accent" destaca em dourado (o próprio usuário).
function Avatar({ name, accent }: { name: string; accent?: boolean }) {
  return (
    <View style={[styles.avatar, accent && styles.avatarAccent]}>
      <Text style={[styles.avatarText, accent && styles.avatarTextAccent]}>
        {initialOf(name)}
      </Text>
    </View>
  );
}

// Tela de ranking (aba Ranking).
export default function RankingScreen() {
  const [items, setItems] = useState<RankingEntry[]>([]);       // linhas já carregadas
  const [me, setMe] = useState<RankingEntry | null>(null);     // a linha do próprio usuário
  const [page, setPage] = useState(1);                         // página atual da paginação
  const [total, setTotal] = useState(0);                       // total de linhas existentes
  const [loading, setLoading] = useState(true);               // carregando a 1ª página?
  const [loadingMore, setLoadingMore] = useState(false);      // carregando próximas páginas?
  const [error, setError] = useState<string | null>(null);    // erro?

  // Carrega a primeira página + a posição do usuário.
  const loadFirst = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Busca em paralelo a 1ª página e a entrada do usuário.
      const [first, myEntry] = await Promise.all([
        getRanking(1, PAGE_SIZE),
        getMyRankingEntry(),
      ]);
      setItems(first.items);  // linhas da página 1
      setTotal(first.total);  // total geral
      setPage(1);             // reseta a página
      setMe(myEntry);         // posição do usuário
    } catch {
      setError('Não foi possível carregar o ranking. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega a primeira página ao montar a tela.
  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  // Carrega a próxima página (chamada ao rolar até perto do fim).
  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return;          // evita chamadas concorrentes
    if (items.length >= total) return;           // já carregou tudo: nada a fazer
    setLoadingMore(true);
    try {
      const next = await getRanking(page + 1, PAGE_SIZE);
      // Acrescenta as novas linhas às já existentes.
      setItems((prev) => [...prev, ...next.items]);
      setPage((p) => p + 1); // avança o número da página
    } catch {
      // mantém o que já carregou; erro de página silencioso
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, items.length, total, page]);

  // Tela de carregamento/erro da primeira carga.
  if (loading || error) {
    return (
      <ScreenContainer>
        <StateView loading={loading} error={error} onRetry={loadFirst} />
      </ScreenContainer>
    );
  }

  // As 3 primeiras posições formam o "pódio".
  const podium = items.slice(0, 3);

  // Desenha uma linha do ranking.
  const renderItem = ({ item }: { item: RankingEntry }) => {
    const isMe = item.userId === CURRENT_USER_ID; // esta linha é do usuário logado?
    return (
      <View
        style={[styles.row, isMe && styles.rowMe]} // destaca a própria linha
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
        keyExtractor={(item) => String(item.userId)} // chave única por usuário
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        onEndReachedThreshold={0.4}  // dispara loadMore quando faltar 40% p/ o fim
        onEndReached={loadMore}      // função de carregar mais
        ListHeaderComponent={        // topo da lista: título, critério e pódio
          <View>
            <Text style={styles.title} accessibilityRole="header">
              Ranking Geral
            </Text>
            <Text style={styles.criteria}>
              Por pontos · desempate por placares exatos
            </Text>

            {/* Pódio */}
            {/* Mostra os 3 primeiros em destaque, lado a lado */}
            <View style={styles.podium}>
              {podium.map((p) => (
                <View
                  key={p.userId}
                  style={[
                    styles.podiumItem,
                    p.position === 1 && styles.podiumFirst, // 1º lugar com borda dourada
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
        ListFooterComponent={        // rodapé: spinner ao carregar mais páginas
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={theme.colors.accent} />
            </View>
          ) : null
        }
      />

      {/* Barra fixa da posição do usuário (RF-033) */}
      {/* Fica "flutuando" sobre a lista, sempre mostrando a posição do usuário */}
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

// Estilos.
const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.lg,
    paddingBottom: 96, // espaço extra para a barra fixa não cobrir o último item
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
    alignItems: 'flex-end',          // alinha pela base (efeito de pódio)
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  podiumItem: {
    flex: 1,                         // três colunas de mesma largura
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  podiumFirst: {
    borderColor: theme.colors.accent, // destaque do 1º lugar
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
    borderColor: theme.colors.accent,        // borda dourada na linha do usuário
    backgroundColor: theme.colors.surfaceAlt,
  },
  position: {
    ...theme.font.title,
    color: theme.colors.textPrimary,
    minWidth: 36,                            // largura fixa p/ alinhar as posições
  },
  accentText: {
    color: theme.colors.accent,
  },
  rowInfo: {
    flex: 1,                                 // ocupa o meio (empurra os pontos p/ a direita)
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
    borderRadius: theme.radius.full,         // círculo
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
    position: 'absolute',                    // posiciona "por cima" da lista
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,                // colada na base
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
