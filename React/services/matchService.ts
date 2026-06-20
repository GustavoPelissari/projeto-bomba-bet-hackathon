// import api from './api'; // (desativado) seria o cliente HTTP real quando houver backend
import { MOCK_MATCHES } from '../mocks/matches'; // dados falsos de partidas (simulação)
import type { Match, MatchStatus, Phase } from '../types/domain'; // tipos do domínio

// Atraso artificial (em ms) para simular o tempo de resposta de uma API real.
const DELAY = 400;

// Função utilitária: devolve uma Promise que resolve "value" após DELAY ms.
// O <T> torna a função genérica — funciona com qualquer tipo de valor.
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY));
}

// Lista todas as partidas. "async" faz a função retornar uma Promise.
export async function listMatches(): Promise<Match[]> {
  // return (await api.get('/matches')).data; // versão real (desativada)
  return delay(MOCK_MATCHES); // versão mock: devolve a lista após o atraso
}

// Busca uma única partida pelo seu id.
export async function getMatch(id: number): Promise<Match> {
  // return (await api.get(`/matches/${id}`)).data; // versão real (desativada)
  // Procura na lista mock a partida cujo id bate com o pedido.
  const match = MOCK_MATCHES.find((m) => m.id === id);
  // Se não encontrou, devolve uma Promise que REJEITA (erro) após o atraso.
  if (!match) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Partida não encontrada')), DELAY)
    );
  }
  // Se encontrou, devolve a partida normalmente após o atraso.
  return delay(match);
}

// Formato (tipo) dos filtros aceitos ao buscar partidas. Todos opcionais ("?").
export type MatchFilter = {
  phase?: Phase;        // filtrar por fase
  status?: MatchStatus; // filtrar por situação
  date?: string; // ISO date (yyyy-mm-dd) — filtrar por dia
};

// Retorna apenas as partidas que satisfazem os filtros informados.
export async function filterMatches(filter: MatchFilter): Promise<Match[]> {
  // return (await api.get('/matches', { params: filter })).data; // versão real (desativada)
  // filter() percorre cada partida e mantém só as que passam em TODAS as checagens.
  const result = MOCK_MATCHES.filter((m) => {
    // Se há filtro de fase e a fase não bate, descarta esta partida.
    if (filter.phase && m.phase !== filter.phase) return false;
    // Se há filtro de status e não bate, descarta.
    if (filter.status && m.status !== filter.status) return false;
    // Se há filtro de data e a data/hora não começa com aquele dia, descarta.
    if (filter.date && !m.datetime.startsWith(filter.date)) return false;
    return true; // passou em tudo: mantém a partida
  });
  return delay(result); // devolve a lista filtrada após o atraso
}
