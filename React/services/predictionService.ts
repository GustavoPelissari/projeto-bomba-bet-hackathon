import { apiGet, apiPost, apiPut } from './api';
import type { Prediction, PredictionCriterion } from '../types/domain';

// Formato cru de um palpite vindo da API (PalpiteResponseDto).
type PalpiteDto = {
  id: number;
  partidaId: number;
  usuario: string;
  golsCasa: number;
  golsVisitante: number;
  pontuacao: number | null;
  criterioPontuacao: string; // PENDENTE, PLACAR_EXATO, VENCEDOR_OU_EMPATE, ERRO_TOTAL
};

// Converte o critério da API para o do app (null = ainda não apurado).
function mapCriterion(c: string): PredictionCriterion | null {
  switch (c) {
    case 'PLACAR_EXATO':
      return 'EXACT';
    case 'VENCEDOR_OU_EMPATE':
      return 'WINNER';
    case 'ERRO_TOTAL':
      return 'MISS';
    default:
      return null; // PENDENTE
  }
}

// Converte PalpiteDto -> Prediction.
function toPrediction(p: PalpiteDto): Prediction {
  const criterion = mapCriterion(p.criterioPontuacao);
  return {
    id: p.id,
    matchId: p.partidaId,
    homeGuess: p.golsCasa,
    awayGuess: p.golsVisitante,
    // Enquanto está PENDENTE (criterion null), mostramos pontos como null.
    points: criterion ? p.pontuacao ?? 0 : null,
    criterion,
  };
}

// Lista os palpites do usuário logado (GET /api/palpites/meus — exige token).
export async function listMyPredictions(): Promise<Prediction[]> {
  const lista = await apiGet<PalpiteDto[]>('/palpites/meus');
  return lista.map(toPrediction);
}

// Busca o palpite do usuário para uma partida específica (ou null).
export async function getPredictionByMatch(
  matchId: number
): Promise<Prediction | null> {
  const lista = await apiGet<PalpiteDto[]>('/palpites/meus');
  const encontrado = lista.find((p) => p.partidaId === matchId);
  return encontrado ? toPrediction(encontrado) : null;
}

// Cria (POST) ou atualiza (PUT) o palpite do usuário para uma partida.
export async function savePrediction(
  matchId: number,
  home: number,
  away: number
): Promise<Prediction> {
  // Descobre se já existe palpite desta partida (para decidir POST x PUT).
  const lista = await apiGet<PalpiteDto[]>('/palpites/meus');
  const existente = lista.find((p) => p.partidaId === matchId);

  const body = {
    partidaId: matchId,
    golsCasa: home,
    golsVisitante: away,
  };

  const salvo = existente
    ? await apiPut<PalpiteDto>(`/palpites/${existente.id}`, body) // edita
    : await apiPost<PalpiteDto>('/palpites', body); // cria

  return toPrediction(salvo);
}
