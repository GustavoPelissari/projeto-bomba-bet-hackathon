import { apiGet, apiPut, apiDelete } from './api';
import type { UserProfile } from '../types/domain';

// Formato cru do usuário vindo da API (UsuarioResponseDto).
type UsuarioDto = {
  id: number;
  nome: string;
  email: string;
  fotoPerfil: string | null;
  privilegio: string;
  pontuacaoTotal: number | null;
  placaresExatos: number | null;
};

// Página do Spring (usada só para descobrir a posição no ranking).
type SpringPage<T> = { content: T[]; totalElements: number; number: number };

// Converte UsuarioDto -> UserProfile (posição entra à parte).
function toProfile(u: UsuarioDto, rankingPosition: number): UserProfile {
  return {
    id: u.id,
    name: u.nome,
    email: u.email,
    avatar: u.fotoPerfil ?? null,
    totalPoints: u.pontuacaoTotal ?? 0,
    rankingPosition,
    exactScores: u.placaresExatos ?? 0,
  };
}

// Descobre a posição do usuário no ranking (best-effort; 0 se não achar).
async function descobrirPosicao(userId: number): Promise<number> {
  try {
    const sp = await apiGet<SpringPage<UsuarioDto>>(
      '/usuarios/ranking?page=0&size=1000'
    );
    const idx = sp.content.findIndex((u) => u.id === userId);
    return idx >= 0 ? idx + 1 : 0;
  } catch {
    return 0; // se o ranking falhar, não quebramos o perfil
  }
}

// Retorna o perfil do usuário logado (GET /api/usuarios/me — exige token).
export async function getProfile(): Promise<UserProfile> {
  const me = await apiGet<UsuarioDto>('/usuarios/me');
  const posicao = await descobrirPosicao(me.id);
  return toProfile(me, posicao);
}

// Dados aceitos ao atualizar o perfil.
export type ProfileUpdate = {
  name: string;
  avatar?: string | null;
};

// Atualiza o perfil (PUT /api/usuarios/me). O backend exige nome + email;
// a senha NÃO é alterada aqui. Reaproveitamos o e-mail atual do /me.
export async function updateProfile(
  data: ProfileUpdate
): Promise<UserProfile> {
  const me = await apiGet<UsuarioDto>('/usuarios/me');
  const body = {
    nome: data.name,
    email: me.email, // mantém o e-mail atual (obrigatório no backend)
    fotoPerfil: data.avatar !== undefined ? data.avatar : me.fotoPerfil,
  };
  const atualizado = await apiPut<UsuarioDto>('/usuarios/me', body);
  const posicao = await descobrirPosicao(atualizado.id);
  return toProfile(atualizado, posicao);
}

// Exclui a conta do usuário logado (não há DELETE /me -> usamos /usuarios/{id}).
export async function deleteAccount(): Promise<void> {
  const me = await apiGet<UsuarioDto>('/usuarios/me');
  await apiDelete<void>(`/usuarios/${me.id}`);
}
