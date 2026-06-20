// import api from './api'; // (desativado) cliente HTTP real para o futuro backend
import { MOCK_USER } from '../mocks/user';                  // dados falsos do usuário
import { MOCK_USER_RANKING_ENTRY } from '../mocks/ranking'; // linha do usuário no ranking falso
import type { UserProfile } from '../types/domain';         // tipo do perfil

// Atraso artificial para simular latência de rede.
const DELAY = 400;

// cópia mutável em memória para refletir edições durante a sessão
let profile: UserProfile = {
  ...MOCK_USER, // copia todos os campos do usuário mock
  // mantém a posição de ranking coerente com o ranking gerado
  rankingPosition: MOCK_USER_RANKING_ENTRY.position,    // posição vinda do ranking mock
  totalPoints: MOCK_USER_RANKING_ENTRY.totalPoints,     // total de pontos vindo do ranking mock
  exactScores: MOCK_USER_RANKING_ENTRY.exactScores,     // placares exatos vindos do ranking mock
};

// Função genérica que resolve um valor após DELAY ms (simula chamada assíncrona).
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY));
}

// Retorna o perfil atual do usuário.
export async function getProfile(): Promise<UserProfile> {
  // return (await api.get('/me')).data; // versão real (desativada)
  return delay({ ...profile }); // devolve uma cópia do perfil após o atraso
}

// Formato (tipo) dos dados aceitos ao atualizar o perfil.
export type ProfileUpdate = {
  name: string;            // novo nome (obrigatório)
  avatar?: string | null;  // novo avatar (opcional: pode ser URL, null p/ remover, ou ausente)
};

// Atualiza o perfil do usuário com os dados recebidos.
export async function updateProfile(
  data: ProfileUpdate
): Promise<UserProfile> {
  // return (await api.put('/me', data)).data; // versão real (desativada)
  profile = {
    ...profile,        // mantém os campos atuais
    name: data.name,   // sobrescreve o nome
    // Só troca o avatar se ele foi informado (!== undefined); senão mantém o atual.
    avatar: data.avatar !== undefined ? data.avatar : profile.avatar,
  };
  return delay({ ...profile }); // devolve o perfil atualizado após o atraso
}

// Exclui a conta do usuário. Retorna Promise<void> (sem dado de retorno).
export async function deleteAccount(): Promise<void> {
  // await api.delete('/me'); // versão real (desativada)
  return delay(undefined); // simula sucesso após o atraso
}
