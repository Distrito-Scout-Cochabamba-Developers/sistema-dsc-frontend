# 0004. Integración HTTP real del registro de asistencia

- Estado: Accepted
- Fecha: 2026-08-18
- Decisores: Equipo DSC
- Relacionado: [0002](./0002-contrato-api-asumido-registro-asistencia.md) (contrato *asumido*; este ADR usa el contrato **real** del backend)

## Contexto

El backend ya expone `GET api/attendance/lookup-ci/{ci}` y `POST api/attendance/register`. El frontend debía sustituir mocks (A-09/A-10, B-01…B-04) **sin modificar el backend**.

## Decisión

- `HttpClient` + `withFetch()` + interceptores `authInterceptor` y `httpRetryInterceptor`.
- Proxy local `/api` → `http://localhost:5090` porque la API no declara CORS.
- `sessionToken` = `TrainingModule.Code` (token de la ruta).
- Metadatos de sesión: presentación local (no hay GET de convocatoria).
- Auth: interceptor listo para Bearer (sin uso); la sesión real usa cookie (ADR 0005).

## Consecuencias

- Lookup y persistencia requieren API + fila `training_module.code`.
- Gaps restantes en [asistencia-backend-gaps.md](../features/asistencia-backend-gaps.md).
