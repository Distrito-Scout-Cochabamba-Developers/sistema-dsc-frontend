# Story 1.1: Buscar y seleccionar módulo-evento

Status: done

## Story

As a Secretaría del Distrito,
I want buscar y seleccionar un módulo-evento específico desde una vista de gestión,
so that pueda luego gestionar la asistencia de sus participantes.

## Acceptance Criteria

1. La Secretaría entra a `/secretaria` y ve una lista de módulos-evento.
2. Al escribir en el buscador, la lista se filtra por nombre o código de módulo en tiempo real.
3. Si no hay coincidencias, se muestra un mensaje de "no se encontraron módulos".
4. Al hacer clic en un módulo, navega a `/secretaria/:moduleEventId`.

## Tasks / Subtasks

- [x] Task 1 (AC: 1,2,3) — `ModuleManagementService.searchModules()` + `ModuleListPage`/`.html`
- [x] Task 2 (AC: 4) — ruta `':moduleEventId'` en `module-management.routes.ts`, navegación con `routerLink`

## Dev Notes

- Sigue el patrón de `features/attendance/attendance-page.ts` (orquestador delgado, servicio dueño del estado).
- Modelos en `core/models/module-management.models.ts` (`ModuleEvent`).
- Sin `HttpClient` (AD-1 de la arquitectura) — datos de ejemplo en `ModuleManagementService`.

### Project Structure Notes

- `src/app/features/module-management/pages/module-list-page.ts` (+ `.html`)
- `src/app/features/module-management/module-management.routes.ts`
- Ruta registrada en `src/app/app.routes.ts` (`path: 'secretaria'`)

### References

- [Source: _bmad-output/planning-artifacts/prds/prd-sistema-dsc-frontend-2026-08-25/prd.md#FR-SEC-01]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-sistema-dsc-frontend-2026-08-25/ARCHITECTURE-SPINE.md#AD-1]

### Review Findings

- [x] [Review][Patch] `module-list-page` (39 líneas) y `module-detail-page` (21 líneas) usaban `templateUrl` en vez de inline, violando agents.md (≤50 líneas → inline) — corregido: templates movidos a `template:` inline, `.html` eliminados.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Completion Notes List

- Implementado y verificado en navegador (Playwright headless): búsqueda filtra en vivo, navegación a detalle funciona.
- Build (`pnpm build`) y unit tests (`pnpm exec ng test --watch=false`) pasan sin errores.

### File List

- src/app/core/models/module-management.models.ts
- src/app/features/module-management/module-management.routes.ts
- src/app/features/module-management/services/module-management.service.ts
- src/app/features/module-management/pages/module-list-page.ts
- src/app/features/module-management/pages/module-list-page.html
- src/app/app.routes.ts
