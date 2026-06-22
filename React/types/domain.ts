// Tipos de domínio do app (em inglês). Os services convertem os DTOs em português
// vindos da API Java para estes tipos.

export type Phase = 'GROUP' | 'ROUND_32' | 'ROUND_16' | 'QUARTER' | 'SEMI' | 'THIRD' | 'FINAL';

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';

export type Team = {
  id: number;
  name: string;
  fifaCode: string;
  flag: string;
  group: string;
};

export type Match = {
  id: number;
  phase: Phase;
  group?: string;
  stadium: string;
  datetime: string;
  status: MatchStatus;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
};

export type PredictionCriterion = 'EXACT' | 'WINNER' | 'MISS';

export type Prediction = {
  id: number;
  matchId: number;
  homeGuess: number;
  awayGuess: number;
  points: number | null;
  criterion: PredictionCriterion | null;
};

export type RankingEntry = {
  position: number;
  userId: number;
  name: string;
  avatar: string | null;
  totalPoints: number;
  exactScores: number;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  totalPoints: number;
  rankingPosition: number;
  exactScores: number;
};
