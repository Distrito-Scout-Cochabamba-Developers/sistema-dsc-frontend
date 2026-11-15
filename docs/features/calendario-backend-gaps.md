# Gaps del backend — calendario e inscripción

El frontend de `/calendario` está listo contra el contrato de [calendario-modulos.md](./calendario-modulos.md). **No hay endpoints aún.** Mitigación: fixtures + `trainingCalendarApiEnabled: false`.

| Gap | Impacto | Mitigación | Falta en API |
| --- | --- | --- | --- |
| No hay GET de convocatorias | Sin fechas, lugar ni cupos reales | Fixtures locales | `GET /api/v1/calendar/sessions` público, proyectando `TrainingModuleSession` + `TrainingModuleSchedule` |
| No hay POST de inscripción | El dirigente no reserva cupo en BD | Fixture muta el array en memoria | `POST /api/v1/calendar/sessions/{id}/enrollments` con `[Authorize]`, 201 / 409 |
| 409 de cupo concurrente | Carrera entre dos inscripciones | UI ya trata `status === 409` y pinta **Cupo lleno** | Transacción / chequeo atómico de cupo; Problem Details `detail` |
| `isEnrolled` | Anónimo no puede saber si ya está inscrito | `false` en fixtures; con JWT debería venir en el GET | Incluir el flag cuando hay Bearer |
| Alta de sesiones (Historia 2.1) | Nadie programa fecha/lugar/cupo | Fuera de esta entrega | Admin de `TrainingModuleSession` |
| Inscripción asistida por Secretaría (Historia 2.3) | No cubierto | — | Búsqueda por CI + cupo |

## Activar la API (cuando exista)

1. Implementar GET público y POST autenticado según el contrato.
2. Scalar: tag **Calendario** (no mezclar con Attendance).
3. En frontend: `trainingCalendarApiEnabled: true` en `environment.ts` y `environment.development.ts`.
4. Quitar el banner de demostración (desaparece solo al activar el flag).

## Preguntas abiertas

1. ¿Cupo vive en la sesión o en el módulo curricular?
2. ¿Una persona puede inscribirse a dos dictados del mismo `moduleCode`?
3. ¿El 409 distingue “cupo agotado” vs “ya inscrito” (`title` / `type` distintos)?
