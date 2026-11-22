# Calendario de módulos (frontend)

- **Estado:** Conectado a `GET/POST /api/v1/calendar/sessions`
- **Ruta:** `/calendario` (pública, cualquier usuario)
- **Entradas:** nav **Calendario**, CTA en inicio, botón **Calendario** en `/modulos`
- **Última actualización:** 2026-11-21

## Qué hace

1. Vista **mensual** (grilla lun–dom, zona local) y vista **lista** de convocatorias próximas.
2. Click en **Inscribirme** (sesión disponible) abre un modal nativo de confirmación.
3. Tras un POST 201 la tarjeta pasa a **Inscrito** con Signals (sin recargar la página).
4. Un **409 Conflict** muestra el `detail`. Si el mensaje no habla de inscripción duplicada, marca **Cupo lleno**.
5. Sin sesión: el modal pide **Iniciar sesión** (`returnUrl=/calendario`). Con JWT: **Confirmar inscripción**.

La inscripción acredita cupo, no asistencia. La asistencia sigue en `/asistencia/:code`.

## Contrato

| Método | Path | Auth | Notas |
| ------ | ---- | ---- | ----- |
| `GET` | `/api/v1/calendar/sessions?from&to` | No (Bearer opcional) | `isEnrolled` si hay JWT. |
| `POST` | `/api/v1/calendar/sessions/{id}/enrollments` | Bearer | Cuerpo vacío. 201 / 401 / 409. |

`moduleCode` es el id del módulo en texto. Fecha/hora salen del primer/último `training_module_schedule`.

`environment.trainingCalendarApiEnabled` está en `true`. Ponerlo en `false` vuelve a las fixtures de demo.

Contrato backend: `sistema-dsc-backend/docs/features/calendario-sesiones.md`.
