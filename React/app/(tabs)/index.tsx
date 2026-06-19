import React, { useCallback, useEffect, useState } from 'react'; // React + hooks
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';                       // navegação imperativa
import { theme } from '../../constants/theme';              // tokens de design
import { getProfile } from '../../services/profileService'; // busca o perfil
import { listMatches } from '../../services/matchService';  // busca as partidas
import { firstName, formatLongDate } from '../../utils/format'; // helpers de texto/data
import type { Match, UserProfile } from '../../types/domain';   // tipos
import ScreenContainer from '../../components/ScreenContainer'; // esqueleto da tela
import StateView from '../../components/StateView';            // estados carregando/erro/vazio
import SectionHeader from '../../components/SectionHeader';    // cabeçalho de seção
import MatchCard from '../../components/MatchCard';            // cartão de partida

// Tela inicial (aba "Início").
export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null); // perfil carregado
  const [matches, setMatches] = useState<Match[]>([]);              // lista de partidas
  const [loading, setLoading] = useState(true);                    // carregando dados?
  const [error, setError] = useState<string | null>(null);         // mensagem de erro

  // Função que carrega perfil e partidas. useCallback evita recriá-la a cada render.
  const load = useCallback(async () => {
    setLoading(true);  // inicia carregamento
    setError(null);    // limpa erro anterior
    try {
      // Promise.all dispara as duas buscas em paralelo e espera ambas terminarem.
      const [p, m] = await Promise.all([getProfile(), listMatches()]);
      setProfile(p);   // guarda o perfil
      setMatches(m);   // guarda as partidas
    } catch {
      // Se qualquer uma falhar, mostra mensagem de erro.
      setError('Não foi possível carregar seus dados. Tente novamente.');
    } finally {
      setLoading(false); // encerra o carregamento
    }
  }, []);

  // Executa "load" uma vez ao montar a tela (e se "load" mudar, o que não ocorre).
  useEffect(() => {
    load();
  }, [load]);

  // Enquanto carrega ou se houve erro, mostra a tela de estado (com botão de retry).
  if (loading || error) {
    return (
      <ScreenContainer>
        <StateView loading={loading} error={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  // Calcula as próximas partidas a serem exibidas.
  const now = Date.now(); // timestamp atual (ms)
  const upcoming = matches
    // mantém só as agendadas cuja data é igual/posterior a agora
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.datetime).getTime() >= now)
    // ordena da mais próxima para a mais distante
    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )
    // pega no máximo 5
    .slice(0, 5);

  return (
    // noPadding: a rolagem aplica o próprio padding (contentContainerStyle).
    <ScreenContainer noPadding>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false} // esconde a barra de rolagem
      >
        {/* Saudação com o primeiro nome do usuário */}
        <Text style={styles.greeting}>
          Olá, {profile ? firstName(profile.name) : ''}!
        </Text>
        {/* Data de hoje por extenso */}
        <Text style={styles.date}>{formatLongDate(new Date().toISOString())}</Text>

        {/* Card de destaque */}
        {/* Cartão com pontos, posição no ranking e placares exatos */}
        <View style={styles.statsCard}>
          <View style={styles.statMain}>
            <Text style={styles.statLabel}>Seus pontos</Text>
            {/* "?? 0" mostra 0 caso totalPoints não exista */}
            <Text style={styles.statPoints}>{profile?.totalPoints ?? 0}</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Posição</Text>
              <Text style={styles.statValue}>{profile?.rankingPosition}º</Text>
            </View>
            <View style={styles.statDivider} />{/* linha vertical divisória */}
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Placares exatos</Text>
              <Text style={styles.statValue}>{profile?.exactScores}</Text>
            </View>
          </View>
        </View>

        {/* Cabeçalho com link "Ver todas" que leva à aba de partidas */}
        <SectionHeader
          title="Próximas partidas"
          right={
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/matches')} // navega p/ a aba Partidas
              accessibilityRole="link"
              accessibilityLabel="Ver todas as partidas"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // aumenta área tocável
            >
              <Text style={styles.link}>Ver todas</Text>
            </TouchableOpacity>
          }
        />

        {upcoming.length === 0 ? (
          // Se não há partidas futuras, mostra um estado de "vazio".
          <StateView
            empty
            emptyIcon="calendar-outline"
            emptyMessage="Nenhuma partida aberta para palpite agora."
          />
        ) : (
          // Caso contrário, renderiza um MatchCard para cada partida.
          // .map cria a lista; "key" ajuda o React a identificar cada item.
          upcoming.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              onPress={() =>
                // Navega para os detalhes da partida, passando o id como parâmetro.
                router.push({ pathname: '/match/[id]', params: { id: m.id } })
              }
            />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

// Estilos da tela.
const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl, // espaço extra no fim p/ não colar na barra de abas
  },
  greeting: {
    ...theme.font.h2,
    color: theme.colors.textPrimary,
  },
  date: {
    ...theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textTransform: 'capitalize', // deixa a 1ª letra de cada palavra maiúscula
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
    alignItems: 'center', // centraliza "Seus pontos" + número
  },
  statPoints: {
    fontSize: 44,         // número grande de destaque
    fontWeight: '800',
    color: theme.colors.accent,
  },
  statRow: {
    flexDirection: 'row', // posição | divisor | placares exatos
    alignItems: 'center',
  },
  statItem: {
    flex: 1,              // cada item ocupa metade da linha
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statDivider: {
    width: 1,            // linha fina vertical
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
