import { apiGet } from './api';
import type { Match, MatchStatus, Phase, Team } from '../types/domain';

// ---- Formatos crus vindos da API Java (DTOs em português) ----
type SelecaoDto = {
  id: number;
  nome: string;
  codigoFifa: string;
  grupo: string;
  bandeira: string;
};

type PartidaDto = {
  id: number;
  selecaoCasa: string | null;       // a API manda só o NOME da seleção
  selecaoVisitante: string | null;
  dataHora: string;                 // LocalDateTime ISO ("2026-06-11T20:00:00")
  estadio: string;
  fase: string;                     // GRUPOS, OITAVAS_DE_FINAL, ...
  grupo: string | null;
  status: string;                   // AGENDADA, EM_ANDAMENTO, ENCERRADA
  golsCasa: number | null;
  golsVisitante: number | null;
};

// ---- Conversões de enum (português -> inglês) ----
function mapStatus(status: string): MatchStatus {
  switch (status) {
    case 'EM_ANDAMENTO':
      return 'LIVE';
    case 'ENCERRADA':
      return 'FINISHED';
    default:
      return 'SCHEDULED'; // AGENDADA
  }
}

function mapPhase(fase: string): Phase {
  switch (fase) {
    case 'DEZESSEIS_AVOS_DE_FINAL':
      return 'ROUND_32';
    case 'OITAVAS_DE_FINAL':
      return 'ROUND_16';
    case 'QUARTAS_DE_FINAL':
      return 'QUARTER';
    case 'SEMIFINAL':
      return 'SEMI';
    case 'DISPUTA_TERCEIRO_LUGAR':
      return 'THIRD';
    case 'FINAL':
      return 'FINAL';
    default:
      return 'GROUP'; // GRUPOS
  }
}

// Monta um Team a partir do nome, buscando bandeira/sigla no mapa de seleções.
function teamFromName(
  name: string | null,
  selecoes: Map<string, SelecaoDto>
): Team {
  const s = name ? selecoes.get(name) : undefined;
  return {
    id: s?.id ?? 0,
    name: name ?? '?',
    fifaCode: s?.codigoFifa ?? '',
    flag: s?.bandeira ?? '',
    group: s?.grupo ?? '',
  };
}

// Converte uma PartidaDto crua em Match (tipo do app).
function toMatch(p: PartidaDto, selecoes: Map<string, SelecaoDto>): Match {
  return {
    id: p.id,
    phase: mapPhase(p.fase),
    group: p.grupo ?? undefined,
    stadium: p.estadio,
    datetime: p.dataHora,
    status: mapStatus(p.status),
    homeTeam: teamFromName(p.selecaoCasa, selecoes),
    awayTeam: teamFromName(p.selecaoVisitante, selecoes),
    homeScore: p.golsCasa ?? null,
    awayScore: p.golsVisitante ?? null,
  };
}

// Busca a lista de seleções e devolve um mapa nome -> seleção (para pegar bandeiras).
async function carregarSelecoes(): Promise<Map<string, SelecaoDto>> {
  const selecoes = await apiGet<SelecaoDto[]>('/selecoes');
  return new Map(selecoes.map((s) => [s.nome, s]));
}

// Lista todas as partidas (GET /api/partidas).
export async function listMatches(): Promise<Match[]> {
  const [partidas, selecoes] = await Promise.all([
    apiGet<PartidaDto[]>('/partidas'),
    carregarSelecoes(),
  ]);
  return partidas.map((p) => toMatch(p, selecoes));
}

// Busca uma partida pelo id (GET /api/partidas/{id}).
export async function getMatch(id: number): Promise<Match> {
  const [partida, selecoes] = await Promise.all([
    apiGet<PartidaDto>(`/partidas/${id}`),
    carregarSelecoes(),
  ]);
  return toMatch(partida, selecoes);
}

// Filtro opcional (mantido por compatibilidade) — filtra no cliente.
export type MatchFilter = {
  phase?: Phase;
  status?: MatchStatus;
  date?: string; // yyyy-mm-dd
};

export async function filterMatches(filter: MatchFilter): Promise<Match[]> {
  const all = await listMatches();
  return all.filter((m) => {
    if (filter.phase && m.phase !== filter.phase) return false;
    if (filter.status && m.status !== filter.status) return false;
    if (filter.date && !m.datetime.startsWith(filter.date)) return false;
    return true;
  });
}
