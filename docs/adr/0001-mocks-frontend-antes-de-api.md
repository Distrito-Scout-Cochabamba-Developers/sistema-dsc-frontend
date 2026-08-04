# 0001. Mocks frontend antes de API de asistencia

- Estado: Accepted
- Fecha: 2026-08-04
- Decisores: Equipo frontend DSC

## Contexto

Se necesita validar UX y acceptance criteria del registro de asistencia sin backend disponible.

## Decisión

Implementar servicios mock en `core` / `features/asistencia` (`AuthSessionService`, `AdultosDirectoryService`, `AsistenciaRegistroService`) con la misma forma de datos prevista para la API futura. La UI no debe acoplarse a detalles de transporte HTTP todavía.

## Consecuencias

- Permite desarrollo y demos inmediatas.
- Requiere un paso explícito de sustitución por `HttpClient` (ver `docs/seguimiento.md` B-01/A-09/A-10).
- Los mocks no deben filtrar a producción: se eliminan o se aíslan por environment cuando exista API.
