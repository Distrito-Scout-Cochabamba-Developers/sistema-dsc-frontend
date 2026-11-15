import { buildMonthGrid, formatMonthTitle, shiftMonth, toIsoDateLocal } from './calendar-month.utils';

describe('calendar-month.utils', () => {
  it('serializa la fecha local como YYYY-MM-DD', () => {
    expect(toIsoDateLocal(new Date(2026, 10, 15))).toBe('2026-11-15');
  });

  it('desplaza el mes y cruza el año', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, monthIndex: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, monthIndex: 11 });
  });

  it('construye 42 celdas lunes-domingo con el 1 de junio de 2026 en la primera', () => {
    const grid = buildMonthGrid(2026, 5);
    expect(grid.length).toBe(42);
    expect(grid[0]?.isoDate).toBe('2026-06-01');
    expect(grid[0]?.inMonth).toBe(true);
  });

  it('formatea el título del mes en español', () => {
    expect(formatMonthTitle(2026, 10)).toContain('2026');
    expect(formatMonthTitle(2026, 10).toLowerCase()).toContain('noviembre');
  });
});
