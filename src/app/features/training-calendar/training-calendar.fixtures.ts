/**
 * Convocatorias de demostración mientras la API de calendario no exista.
 * Las fechas se anclan a `now` para que el mes en curso nunca quede vacío.
 */
import type { CalendarSessionApiDto } from './training-calendar.models';

/**
 * Construye un instante local y lo serializa a ISO-8601.
 *
 * @param now - Día de referencia.
 * @param dayOffset - Días a sumar (negativo = pasado).
 * @param hours - Hora local.
 * @param minutes - Minutos.
 */
function atLocal(now: Date, dayOffset: number, hours: number, minutes: number): string {
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + dayOffset,
    hours,
    minutes,
    0,
    0,
  );
  return date.toISOString();
}

/**
 * Sesiones de demo para la vista mensual y la lista de próximos.
 *
 * @param now - Reloj de referencia (inyectable en tests).
 */
export function buildCalendarFixtures(now: Date = new Date()): CalendarSessionApiDto[] {
  return [
    {
      id: 101,
      moduleCode: 'SCOUT_METHOD_AND_PROGRAM',
      moduleName: 'Método Scout y Programa',
      moduleTypeCode: 'PJ',
      moduleTypeName: 'Programa de Jóvenes',
      startsAt: atLocal(now, -5, 9, 0),
      endsAt: atLocal(now, -5, 13, 0),
      location: 'Casa Scout Cochabamba',
      status: 'FINISHED',
      capacity: 30,
      enrolledCount: 28,
      remainingSeats: 2,
      isEnrolled: false,
    },
    {
      id: 102,
      moduleCode: 'mod-liderazgo-20241024',
      moduleName: 'Módulo de Liderazgo y Servicio',
      moduleTypeCode: 'AE',
      moduleTypeName: 'Adultos en el Escultismo',
      startsAt: atLocal(now, 2, 8, 30),
      endsAt: atLocal(now, 2, 12, 30),
      location: 'Sala de formación · Casa Scout',
      status: 'OPEN',
      capacity: 24,
      enrolledCount: 11,
      remainingSeats: 13,
      isEnrolled: false,
    },
    {
      id: 103,
      moduleCode: 'FIRST_AID',
      moduleName: 'Primeros auxilios',
      moduleTypeCode: 'AE',
      moduleTypeName: 'Adultos en el Escultismo',
      startsAt: atLocal(now, 6, 14, 0),
      endsAt: atLocal(now, 6, 18, 0),
      location: 'Amphitheater DSC',
      status: 'FULL',
      capacity: 20,
      enrolledCount: 20,
      remainingSeats: 0,
      isEnrolled: false,
    },
    {
      id: 104,
      moduleCode: 'CHILD_PROTECTION',
      moduleName: 'Protección a niños, niñas y adolescentes',
      moduleTypeCode: 'AE',
      moduleTypeName: 'Adultos en el Escultismo',
      startsAt: atLocal(now, 12, 9, 0),
      endsAt: atLocal(now, 12, 13, 0),
      location: 'Casa Scout Cochabamba',
      status: 'OPEN',
      capacity: 18,
      enrolledCount: 17,
      remainingSeats: 1,
      isEnrolled: false,
    },
    {
      id: 105,
      moduleCode: 'mod-liderazgo-20241024',
      moduleName: 'Módulo de Liderazgo y Servicio',
      moduleTypeCode: 'AE',
      moduleTypeName: 'Adultos en el Escultismo',
      startsAt: atLocal(now, 20, 8, 0),
      endsAt: atLocal(now, 20, 16, 0),
      location: null,
      status: 'OPEN',
      capacity: null,
      enrolledCount: 4,
      remainingSeats: null,
      isEnrolled: false,
    },
  ];
}
