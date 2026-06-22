import { apiGet, apiPost, apiPut } from './api';
import type { Prediction, PredictionCriterion } from '../types/domain';

type PalpiteDto = {
  id: number;
  partidaId: number;
  usuario: string;
  golsCasa: number;
  golsVisitante: number;
  pontuacao: number | null;
  criterioPontuacao: string;
};

function mapCriterion(c: string): PredictionCriterion | null {
  switch (c) {
    case 'PLACAR_EXATO':
      return 'EXACT';
    case 'VENCEDOR_OU_EMPATE':
      return 'WINNER';
    case 'ERRO_TOTAL':
      return 'MISS';
    default:
      return null;
  }
}

function toPrediction(p: PalpiteDto): Prediction {
  const criterion = mapCriterion(p.criterioPontuacao);
  return {
    id: p.id,
    matchId: p.partidaId,
    homeGuess: p.golsCasa,
    awayGuess: p.golsVisitante,
    points: criterion ? p.pontuacao ?? 0 : null,
    criterion,
  };
}

export async function listMyPredictions(): Promise<Prediction[]> {
  const lista = await apiGet<PalpiteDto[]>('/palpites/meus');
  return lista.map(toPrediction);
}

export async function getPredictionByMatch(
  matchId: number
): Promise<Prediction | null> {
  const lista = await apiGet<PalpiteDto[]>('/palpites/meus');
  const encontrado = lista.find((p) => p.partidaId === matchId);
  return encontrado ? toPrediction(encontrado) : null;
}

// Cria (POST) ou atualiza (PUT) o palpite do usuário conforme já exista ou não.
export async function savePrediction(
  matchId: number,
  home: number,
  away: number
): Promise<Prediction> {
  const lista = await apiGet<PalpiteDto[]>('/palpites/meus');
  const existente = lista.find((p) => p.partidaId === matchId);

  const body = {
    partidaId: matchId,
    golsCasa: home,
    golsVisitante: away,
  };

  const salvo = existente
    ? await apiPut<PalpiteDto>(`/palpites/${existente.id}`, body)
    : await apiPost<PalpiteDto>('/palpites', body);

  return toPrediction(salvo);
}
