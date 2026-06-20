// import api from './api'; // (desativado) cliente HTTP real para o futuro backend
import { MOCK_PREDICTIONS } from '../mocks/predictions'; // palpites falsos iniciais
import { MOCK_MATCHES } from '../mocks/matches';         // partidas falsas (p/ validar regras)
import type { Prediction } from '../types/domain';       // tipo do palpite

// Atraso artificial para simular latência de rede.
const DELAY = 400;

// cópia mutável em memória para simular persistência durante a sessão
// "[...MOCK_PREDICTIONS]" cria uma cópia do array para não alterar o original.
let predictions: Prediction[] = [...MOCK_PREDICTIONS];
// Calcula o próximo id disponível: maior id existente + 1 (ou 1 se a lista for vazia).
let nextId = Math.max(...MOCK_PREDICTIONS.map((p) => p.id), 0) + 1;

// Função genérica que resolve um valor após DELAY ms (simula chamada assíncrona).
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY));
}

// Lista todos os palpites do usuário atual.
export async function listMyPredictions(): Promise<Prediction[]> {
  // return (await api.get('/predictions/me')).data; // versão real (desativada)
  return delay([...predictions]); // devolve uma cópia da lista após o atraso
}

// Busca o palpite de uma partida específica (ou null se não houver).
export async function getPredictionByMatch(
  matchId: number
): Promise<Prediction | null> {
  // return (await api.get(`/predictions?matchId=${matchId}`)).data; // versão real (desativada)
  // find() retorna o palpite com aquele matchId; "?? null" garante null se não achar.
  return delay(predictions.find((p) => p.matchId === matchId) ?? null);
}

// Cria ou atualiza o palpite do usuário para uma partida.
export async function savePrediction(
  matchId: number, // id da partida
  home: number,    // placar palpitado para o mandante
  away: number     // placar palpitado para o visitante
): Promise<Prediction> {
  // return (await api.post('/predictions', { matchId, home, away })).data; // versão real (desativada)
  // Localiza a partida para validar se ainda é permitido palpitar.
  const match = MOCK_MATCHES.find((m) => m.id === matchId);
  // Regra: só pode palpitar em partida existente e ainda AGENDADA (não iniciada).
  if (!match || match.status !== 'SCHEDULED') {
    // Caso contrário, rejeita com erro "Palpite bloqueado" após o atraso.
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Palpite bloqueado')), DELAY)
    );
  }
  // Verifica se já existe um palpite para esta partida (para atualizar em vez de criar).
  const existing = predictions.find((p) => p.matchId === matchId);
  let saved: Prediction; // guardará o palpite final (novo ou atualizado)
  if (existing) {
    // Já existe: cria uma cópia com os novos placares (atualização).
    saved = { ...existing, homeGuess: home, awayGuess: away };
    // Substitui o antigo pelo atualizado dentro do array.
    predictions = predictions.map((p) => (p.id === existing.id ? saved : p));
  } else {
    // Não existe: monta um palpite novo do zero.
    saved = {
      id: nextId++, // usa o próximo id e incrementa o contador
      matchId,
      homeGuess: home,
      awayGuess: away,
      points: null,    // ainda não pontuado
      criterion: null, // ainda não apurado
    };
    // Adiciona o novo palpite à lista (cópia com o item extra no fim).
    predictions = [...predictions, saved];
  }
  return delay(saved); // devolve o palpite salvo após o atraso
}
