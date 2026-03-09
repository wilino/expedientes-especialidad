import {
  buildDashboardPeriods,
  calculateTrendPercent,
  clampPercent,
  resolveTrendDirection,
  toPercent,
} from './dashboard-metrics';

describe('dashboard-metrics', () => {
  it('buildDashboardPeriods builds current and previous windows', () => {
    const now = new Date('2026-03-09T12:00:00.000Z');
    const periods = buildDashboardPeriods(30, now);

    expect(periods.currentTo.toISOString()).toBe('2026-03-09T12:00:00.000Z');
    expect(periods.currentFrom.toISOString()).toBe('2026-02-07T12:00:00.000Z');
    expect(periods.previousTo.toISOString()).toBe('2026-02-07T12:00:00.000Z');
    expect(periods.previousFrom.toISOString()).toBe('2026-01-08T12:00:00.000Z');
  });

  it('calculateTrendPercent handles previous = 0', () => {
    expect(calculateTrendPercent(15, 0)).toBe(100);
    expect(calculateTrendPercent(0, 0)).toBe(0);
  });

  it('calculateTrendPercent computes positive and negative trends', () => {
    expect(calculateTrendPercent(20, 10)).toBe(100);
    expect(calculateTrendPercent(5, 10)).toBe(-50);
  });

  it('resolveTrendDirection resolves up/down/flat', () => {
    expect(resolveTrendDirection(8, 3)).toBe('up');
    expect(resolveTrendDirection(3, 8)).toBe('down');
    expect(resolveTrendDirection(4, 4)).toBe('flat');
  });

  it('toPercent and clampPercent clamp to 0..100', () => {
    expect(toPercent(50, 200)).toBe(25);
    expect(toPercent(10, 0)).toBe(0);
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(-10)).toBe(0);
  });
});
