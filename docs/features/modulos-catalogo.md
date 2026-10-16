# Catálogo de módulos (frontend)

- **Estado:** Entregado (2026-10-16)
- **Ruta:** `/modulos`
- **Formulario:** solo en `/asistencia/:sessionId`, después de elegir un ítem (o deep link)

## Qué cambió

Antes el CTA de inicio y «Módulos» apuntaban directo al formulario demo. Ahora:

1. `/modulos` pide `GET /api/attendance/modules` y pinta tarjetas (nombre, tipo, descripción).
2. El click navega a `/asistencia/{code}`.
3. Esa página pide `GET /api/attendance/modules/{code}`. Si 404 o código vacío → «Sesión no válida», **sin** formulario.
4. Landing y navbar apuntan a `/modulos`.

## Archivos

| Archivo | Rol |
| ------- | --- |
| `src/app/features/modules/module-catalog.ts` + `.html` | Listado, estados vacío/error/retry |
| `src/app/features/modules/modules.routes.ts` | Lazy `path: ''` bajo `/modulos` |
| `src/app/features/modules/module-catalog.spec.ts` | Lista y enlace al formulario; no muestra CI |
| `src/app/core/services/training-modules.service.ts` | `list()`, `getByCode()`, `getModuleSession()` |
| `src/app/core/models/attendance-api.models.ts` | `TrainingModuleApiDto` |
| `src/app/core/utils/session-presentation.utils.ts` | `toModuleSession(dto)` (ya no fabrica la sesión en el cliente) |
| `src/app/features/attendance/attendance-page.ts` | Carga el módulo por código; 404 → error de sesión |
| `src/app/app.routes.ts` | `path: 'modulos'` |
| `src/app/layout/main-layout/main-layout.html` | Nav «Módulos» → `/modulos` |
| `src/app/features/landing/landing.ts` | CTA «Ver módulos e inscribirse» |
| `e2e/attendance.spec.ts` | Código inexistente espera «Sesión no válida» |

`AdultDirectoryService` solo hace lookup por CI.

## Contrato

Ver [contrato-api-asistencia.md](./contrato-api-asistencia.md). DTO camelCase: `id`, `code`, `name`, `description`, `moduleTypeCode`, `moduleTypeName`.

## Cómo probar

Con API + semilla Docker:

- http://localhost:4200/modulos — cuatro módulos, sin campos de CI.
- Click en «Módulo de Liderazgo y Servicio» → formulario.
- http://localhost:4200/asistencia/CODIGO-QUE-NO-EXISTE → «Sesión no válida».

Semillas: `docker/seed-dev-modules.sql` (módulos) y `docker/seed-dev-user.sql` (tipos de contacto; sin ellos el POST da 500). Detalle en el backend: `sistema-dsc-backend/docs/features/`.
