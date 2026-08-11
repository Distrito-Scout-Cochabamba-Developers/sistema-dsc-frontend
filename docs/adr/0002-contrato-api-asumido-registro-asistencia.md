# 0002. Contrato de API asumido para Registro de Asistencia (Módulo A / FR-REG)

- Estado: Proposed
- Fecha: 2026-08-04
- Decisores: Equipo frontend DSC (propone) — pendiente de validación por Architect backend

## Contexto

El ADR [0001](./0001-mocks-frontend-antes-de-api.md) autorizó implementar la feature `asistencia` con servicios mock en frontend mientras no existe backend (`sistema-dsc-backend` sigue siendo scaffold: `DSC.Domain`, `DSC.Application`, `DSC.Infrastructure` sin entidades reales). El PRD del backend (`_bmad-output/planning-artifacts/prd.md`) ya describe formalmente este alcance como **Módulo A: `FR-REG-01` a `FR-REG-06`**, pero no existe todavía una Architecture/Epic que traduzca esos requisitos a un contrato técnico (entidades, DTOs, endpoints).

Como resultado, el frontend tomó decisiones de forma unilateral sobre la forma de los datos y las reglas de validación, únicamente para poder construir la UI. Este ADR existe para que esas decisiones queden **explícitas y revisables**, en vez de ocultas dentro de `core/services/*` y `core/utils/ci.utils.ts`, y sirvan de insumo para el ítem `B-01` de `docs/seguimiento.md`.

## Decisión (propuesta)

### Endpoints asumidos

| Método | Ruta propuesta | Uso | FR relacionado |
| --- | --- | --- | --- |
| `GET` | `/api/asistencia/sesiones/{sessionId}` | Resolver metadatos de la sesión de módulo desde el deep link/QR | `FR-REG-01` |
| `GET` | `/api/adultos/{ci}` | Lookup de adulto del distrito por CI (autocompletado) | `FR-REG-03` |
| `GET` | `/api/auth/session` | Recuperar perfil del dirigente autenticado (o 401) | `FR-REG-04` |
| `POST` | `/api/asistencia/registros` | Registrar asistencia (completa o parcial) | `FR-REG-02`, `FR-REG-05`, `FR-REG-06` |

Implementación actual mock equivalente: `AdultosDirectoryService.getModuloSesion/lookupByCi`, `AuthSessionService.session`, `AsistenciaRegistroService.register` (ver `src/app/core/services/` y `src/app/features/asistencia/services/`).

### DTOs asumidos (`core/models/asistencia.models.ts`)

- `ModuloSesion`: `sessionId, moduleTitle, moduleName, description, dateLabel, timeLabel, imageAlt, imageUrl`
- `AdultoDistrito`: `ci, fullName, extension, phone`
- `DirigenteSession`: `id, displayName, fullName, ci, extension, phone`
- `RegistroAsistenciaPayload`: `sessionId, ci, fullName, extension, phone, estado: EstadoRegistroAsistencia`
- `RegistroAsistenciaResult`: `registrationId, participantName, moduleSummary, sessionDate, sessionTime, estado: EstadoRegistroAsistencia`
- `DepartamentoCode`: unión cerrada de los 9 códigos de departamento de Bolivia.
- `EstadoRegistroAsistencia`: `'completo' | 'parcial'` — modelo provisional del frontend (ver pregunta abierta #2).

### Reglas de validación asumidas (`core/utils/ci.utils.ts`)

- **CI**: solo dígitos, longitud 7–10 (`CI_NUMBER_PATTERN` / `isValidCiNumber`).
- **Teléfono**: solo dígitos, longitud exacta 8 (`BOLIVIA_MOBILE_PATTERN` / `isValidBoliviaMobile`), asumiendo móvil boliviano.
- **Extensión (departamento)**: catálogo cerrado y **hardcodeado en frontend** (`CI_EXTENSIONS`, 9 departamentos de Bolivia) — no proviene de ningún endpoint.

## Preguntas abiertas para el Architect del backend

Estas son decisiones que el frontend NO puede tomar por sí solo y que este ADR deja pendientes explícitamente:

1. **Autenticación real**: el PRD (`NFR-SEC-01`) exige JWT Bearer con roles (`DD`, `SD`, `CAE`, `DS`, etc.). El mock actual (`AuthSessionService`) no tiene login real ni interceptor — falta decidir el flujo completo (login endpoint, almacenamiento de token, refresh).
2. **Ciclo de vida del "Registro Parcial"** (`FR-REG-05` + `FR-SEC-02`/`FR-SEC-03`): el mock modela un campo `estado: 'completo' | 'parcial'`. El contrato real probablemente necesita más estados (ej. `'regularizado'`) y un endpoint para que Secretaría (`SD`) lo complete — no solo un valor de un solo sentido.
3. **Generación del QR/enlace** (`FR-REG-01`): no está decidido si el backend genera y persiste el `sessionId`/QR (endpoint de creación de sesión para `SD`/`CAE`) o si es responsabilidad exclusiva del frontend generar un QR client-side apuntando a un `sessionId` ya creado manualmente.
4. **Catálogo de extensiones/departamentos**: ¿debe venir de un endpoint (`GET /api/catalogos/extensiones`) en vez de estar hardcodeado en el frontend? Afecta mantenibilidad si cambia la taxonomía.

## Consecuencias

- Este documento es la referencia única de "qué asumió el frontend" — cualquier cambio de forma de datos debe reflejarse aquí antes que en código.
- Cuando el backend defina su Architecture real para `FR-REG`, este ADR debe pasar a **Accepted** (si el contrato coincide) o ser **reemplazado/superado** por una versión acordada conjuntamente — no debe quedar como fuente de verdad silenciosa.
- Las 4 preguntas abiertas bloquean cerrar `B-01` en `docs/seguimiento.md` y deben resolverse con el rol Architect antes de conectar `HttpClient` real (`A-09`, `A-10`, `A-11`).
