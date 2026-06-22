import { apiGet } from './api';
import type { Match, MatchStatus, Phase, Team } from '../types/domain';

type SelecaoDto = {
  id: number;
  nome: string;
  codigoFifa: string;
  grupo: string;
  bandeira: string;
};

type PartidaDto = {
  id: number;
  selecaoCasa: string | null;
  selecaoVisitante: string | null;
  dataHora: string;
  estadio: string;
  fase: string;
  grupo: string | null;
  status: string;
  golsCasa: number | null;
  golsVisitante: number | null;
};

function mapStatus(status: string): MatchStatus {
  switch (status) {
    case 'EM_ANDAMENTO':
      return 'LIVE';
    case 'ENCERRADA':
      return 'FINISHED';
    default:
      return 'SCHEDULED';
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
      return 'GROUP';
  }
}

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

// Converte a PartidaDto crua da API no tipo Match usado pelas telas.
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

async function carregarSelecoes(): Promise<Map<string, SelecaoDto>> {
  const selecoes = await apiGet<SelecaoDto[]>('/selecoes');
  return new Map(selecoes.map((s) => [s.nome, s]));
}

export async function listMatches(): Promise<Match[]> {
  const [partidas, selecoes] = await Promise.all([
    apiGet<PartidaDto[]>('/partidas'),
    carregarSelecoes(),
  ]);
  return partidas.map((p) => toMatch(p, selecoes));
}

export async function getMatch(id: number): Promise<Match> {
  const [partida, selecoes] = await Promise.all([
    apiGet<PartidaDto>(`/partidas/${id}`),
    carregarSelecoes(),
  ]);
  return toMatch(partida, selecoes);
}

export type MatchFilter = {
  phase?: Phase;
  status?: MatchStatus;
  date?: string;
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
