import type { Phase } from '../types/domain';

// Rótulos das fases em português.
const PHASE_LABELS: Record<Phase, string> = {
  GROUP: 'Fase de Grupos',
  ROUND_16: 'Oitavas de Final',
  QUARTER: 'Quartas de Final',
  SEMI: 'Semifinal',
  THIRD: 'Disputa de 3º lugar',
  FINAL: 'Final',
};

export function phaseLabel(phase: Phase): string {
  return PHASE_LABELS[phase] ?? phase;
}

/** Formata uma data ISO para PT-BR, ex.: "14 de jun, 16:00". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const datePart = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return `${datePart}, ${timePart}`;
}

/** Apenas a data por extenso, ex.: "segunda, 14 de junho". */
export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date);
}

// Primeiro nome.
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

// Inicial (1ª letra maiúscula) — usada nos avatares.
export function initialOf(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase();
}
