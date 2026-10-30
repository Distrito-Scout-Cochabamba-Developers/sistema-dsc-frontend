# Contrato HTTP real — Registro de asistencia

Fuente: `AttendanceController` y DTOs de `sistema-dsc-backend` (solo lectura).

Base local: `/api` (proxy `ng serve` → `http://localhost:5090`). JSON camelCase.

## Endpoints usados

### `GET /api/attendance/modules`

Catálogo para `/modulos`. `200` → `TrainingModuleApiDto[]` (puede ser vacío).

### `GET /api/attendance/modules/{code}`

Metadatos del módulo (`code` = `sessionToken` del POST). `200` → `TrainingModuleApiDto`. `404` → el formulario no se abre.

`TrainingModuleApiDto`: `id`, `code`, `name`, `description`, `moduleTypeCode`, `moduleTypeName`.

### `GET /api/attendance/lookup-ci/{ci}?extension=`

| | |
| - | - |
| 200 | `ScoutLeaderApiDto` |
| 404 | CI desconocido → registro parcial |
| 400 | CI o extensión inválidos |

### `POST /api/attendance/register`

`sessionToken` = `TrainingModule.Code`.

| | |
| - | - |
| 201 | `ModuleAttendanceResultApiDto` |
| 400 | Validación de dominio |
| 404 | No existe módulo con ese código |
| 409 | Asistencia duplicada |

El formulario tiene un solo nombre: se parte en `firstName` / `lastName`.
`estado` UI `'parcial' | 'completo'` se deriva de `isPartialRegistration`.

Tipos TS: `src/app/core/models/attendance-api.models.ts`.
