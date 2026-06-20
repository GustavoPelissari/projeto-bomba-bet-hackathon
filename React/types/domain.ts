/**
 * Tipos de domínio do app (lado React), em inglês.
 * Os serviços (services/) convertem os DTOs em português vindos da API Java
 * para estes tipos. Assim as telas continuam usando nomes em inglês.
 */

// Fases do torneio. THIRD = disputa de 3º lugar (DISPUTA_TERCEIRO_LUGAR na API).
export type Phase = 'GROUP' | 'ROUND_16' | 'QUARTER' | 'SEMI' | 'THIRD' | 'FINAL';

// Situação da partida.
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';

// Seleção/time.
export type Team = {
  id: number;
  name: string;     // nome (ex.: "Brasil")
  fifaCode: string; // sigla FIFA (ex.: "BRA")
  flag: string;     // bandeira (emoji ou texto)
  group: string;    // grupo (ex.: "A")
};

// Partida.
export type Match = {
  id: number;
  phase: Phase;
  group?: string;
  stadium: string;
  datetime: string;          // ISO (vem de dataHora)
  status: MatchStatus;
  homeTeam: Team;            // mandante
  awayTeam: Team;            // visitante
  homeScore: number | null;  // gols do mandante (null se sem resultado)
  awayScore: number | null;  // gols do visitante
};

// Critério de pontuação de um palpite.
export type PredictionCriterion = 'EXACT' | 'WINNER' | 'MISS';

// Palpite do usuário.
export type Prediction = {
  id: number;
  matchId: number;
  homeGuess: number;
  awayGuess: number;
  points: number | null;                 // null enquanto não apurado (PENDENTE)
  criterion: PredictionCriterion | null; // null enquanto não apurado
};

// Linha do ranking.
export type RankingEntry = {
  position: number;
  userId: number;
  name: string;
  avatar: string | null;
  totalPoints: number;
  exactScores: number;
};

// Perfil do usuário logado.
export type UserProfile = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  totalPoints: number;
  rankingPosition: number;
  exactScores: number;
};
