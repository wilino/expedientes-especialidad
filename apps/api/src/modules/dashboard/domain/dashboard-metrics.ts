export type TrendDirection = 'up' | 'down' | 'flat';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DashboardPeriods {
  currentFrom: Date;
  currentTo: Date;
  previousFrom: Date;
  previousTo: Date;
}

export function buildDashboardPeriods(
  windowDays: number,
  now = new Date(),
): DashboardPeriods {
  const safeWindowDays = Math.max(1, Math.floor(windowDays));
  const currentTo = new Date(now);
  const currentFrom = new Date(currentTo.getTime() - safeWindowDays * DAY_MS);
  const previousTo = new Date(currentFrom);
  const previousFrom = new Date(previousTo.getTime() - safeWindowDays * DAY_MS);

  return {
    currentFrom,
    currentTo,
    previousFrom,
    previousTo,
  };
}

export function toPercent(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return clampPercent((numerator / denominator) * 100);
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

export function calculateTrendPercent(
  current: number,
  previous: number,
): number {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export function resolveTrendDirection(
  current: number,
  previous: number,
): TrendDirection {
  if (current > previous) {
    return 'up';
  }

  if (current < previous) {
    return 'down';
  }

  return 'flat';
}
