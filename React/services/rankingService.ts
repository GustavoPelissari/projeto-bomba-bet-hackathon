import { apiGet } from './api';
import type { RankingEntry } from '../types/domain';

// Formato cru de um usuário vindo da API (UsuarioResponseDto).
type UsuarioDto = {
  id: number;
  nome: string;
  email: string;
  fotoPerfil: string | null;
  privilegio: string;
  pontuacaoTotal: number | null;
  placaresExatos: number | null;
};

// Formato da página do Spring Data (GET /api/usuarios/ranking).
type SpringPage<T> = {
  content: T[];
  totalElements: number;
  number: number; // página atual (base 0)
};

// Página de ranking no formato esperado pelas telas.
export type RankingPage = {
  items: RankingEntry[];
  total: number;
  page: number;
};

// Converte UsuarioDto + posição -> RankingEntry.
function toEntry(u: UsuarioDto, position: number): RankingEntry {
  return {
    position,
    userId: u.id,
    name: u.nome,
    avatar: u.fotoPerfil ?? null,
    totalPoints: u.pontuacaoTotal ?? 0,
    exactScores: u.placaresExatos ?? 0,
  };
}

// Busca uma página do ranking. A tela usa páginas a partir de 1;
// o Spring usa a partir de 0, então convertemos (page - 1).
export async function getRanking(
  page = 1,
  size = 50
): Promise<RankingPage> {
  const sp = await apiGet<SpringPage<UsuarioDto>>(
    `/usuarios/ranking?page=${page - 1}&size=${size}`
  );
  const items = sp.content.map((u, i) =>
    toEntry(u, (page - 1) * size + i + 1)
  );
  return { items, total: sp.totalElements, page };
}

// Retorna a linha do ranking do usuário logado (com sua posição real).
export async function getMyRankingEntry(): Promise<RankingEntry> {
  // Pega o perfil logado (para saber o id) e uma fatia grande do ranking.
  const [me, sp] = await Promise.all([
    apiGet<UsuarioDto>('/usuarios/me'),
    apiGet<SpringPage<UsuarioDto>>('/usuarios/ranking?page=0&size=1000'),
  ]);
  const idx = sp.content.findIndex((u) => u.id === me.id);
  const position = idx >= 0 ? idx + 1 : 0;
  return toEntry(idx >= 0 ? sp.content[idx] : me, position);
}
