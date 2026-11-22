import { canEnroll, sessionBadge, sessionSeatsLabel } from './calendar-session.utils';
import type { CalendarSessionApiDto } from './training-calendar.models';

describe('calendar-session.utils', () => {
  const now = new Date('2026-11-10T12:00:00');

  function session(partial: Partial<CalendarSessionApiDto>): CalendarSessionApiDto {
    return {
      id: 1,
      moduleCode: 'M1',
      moduleName: 'Módulo',
      moduleTypeCode: 'AE',
      moduleTypeName: 'Adultos en el Escultismo',
      startsAt: '2026-11-12T12:00:00.000Z',
      endsAt: '2026-11-12T16:00:00.000Z',
      location: null,
      status: 'OPEN',
      capacity: 10,
      enrolledCount: 3,
      remainingSeats: 7,
      isEnrolled: false,
      ...partial,
    };
  }

  it('marca disponible una sesión abierta con cupos', () => {
    const open = session({});
    expect(sessionBadge(open, now)).toBe('available');
    expect(canEnroll(open, now)).toBe(true);
  });

  it('prioriza inscrito sobre cupos restantes', () => {
    expect(sessionBadge(session({ isEnrolled: true }), now)).toBe('enrolled');
    expect(canEnroll(session({ isEnrolled: true }), now)).toBe(false);
  });

  it('marca cupo lleno y finalizado', () => {
    expect(sessionBadge(session({ status: 'FULL', remainingSeats: 0 }), now)).toBe('full');
    expect(
      sessionBadge(session({ startsAt: '2026-11-01T12:00:00.000Z', status: 'OPEN' }), now),
    ).toBe('finished');
  });

  it('describe cupos ilimitados', () => {
    expect(sessionSeatsLabel(session({ capacity: null, remainingSeats: null }))).toBe(
      'Sin cupo límite',
    );
  });
});
