# Calendario de módulos (frontend)

- **Estado:** UI lista; API pendiente (fixtures en desarrollo)
- **Ruta:** `/calendario` (pública, cualquier usuario)
- **Entradas:** nav **Calendario**, CTA en inicio, botón **Calendario** en `/modulos`
- **Última actualización:** 2026-11-15

## Qué hace

1. Vista **mensual** (grilla lun–dom, zona local) y vista **lista** de convocatorias próximas.
2. Click en **Inscribirme** (sesión disponible) abre un modal nativo de confirmación.
3. Tras un POST 201 la tarjeta pasa a **Inscrito** con Signals (sin recargar la página).
4. Un **409 Conflict** muestra el `detail` y marca la sesión como **Cupo lleno**.
5. Sin sesión: el modal pide **Iniciar sesión** (`returnUrl=/calendario`). Con JWT: **Confirmar inscripción**.

La inscripción acredita cupo, no asistencia. La asistencia sigue en `/asistencia/:code`.

## Contrato previsto (aún no existe en el backend)

| Método | Path | Auth | Notas |
| ------ | ---- | ---- | ----- |
| `GET` | `/api/v1/calendar/sessions?from&to` | No | Listado público. `from`/`to` ISO `YYYY-MM-DD` opcionales. |
| `POST` | `/api/v1/calendar/sessions/{id}/enrollments` | Bearer | Cuerpo vacío. 201 + sesión actualizada. 401 sin JWT. 409 cupo agotado o ya inscrito. |

DTO camelCase: `id`, `moduleCode`, `moduleName`, `moduleTypeCode`, `moduleTypeName`, `startsAt`, `endsAt`, `location`, `status` (`SCHEDULED` \| `OPEN` \| `FULL` \| `IN_PROGRESS` \| `FINISHED` \| `CANCELLED`), `capacity`, `enrolledCount`, `remainingSeats`, `isEnrolled`.

Hasta que el backend publique esos paths, `environment.trainingCalendarApiEnabled` es `false` y `TrainingCalendarService` sirve fixtures con la misma forma. Poner el flag en `true` conecta `HttpClient`.

## Archivos

| Archivo | Rol |
| ------- | --- |
| `src/app/features/training-calendar/training-calendar-page.ts` + `.html` | Página, Signals, 409 |
| `src/app/features/training-calendar/components/` | Mes, tarjeta, modal |
| `src/app/features/training-calendar/services/training-calendar.ts` | GET/POST o fixtures |
| `src/app/app.routes.ts` | `path: 'calendario'` lazy |
| `src/app/layout/main-layout/main-layout.html` | Nav pública |
| `src/app/features/landing/landing.ts` | CTA **Ver calendario** |
| `src/app/features/modules/module-catalog.html` | Botón **Calendario** |
| `src/environments/environment*.ts` | `trainingCalendarApiEnabled` |

Shared: `StateCard` (error de carga), `SummaryList` (resumen del modal). No hay control shared de grilla mensual.

## Cómo probar

```bash
pnpm start
```

- http://localhost:4200/calendario — mes + próximos (datos de demo).
- Inicio y `/modulos` enlazan al calendario.
- Sin login: Inscribirme → Iniciar sesión.
- Login `pablo.rocha` / `1234` → confirmar → la tarjeta pasa a Inscrito.

Gaps y activación de API: [calendario-backend-gaps.md](./calendario-backend-gaps.md).
