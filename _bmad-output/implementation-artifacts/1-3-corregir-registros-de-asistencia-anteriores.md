# Story 1.3: Corregir registros de asistencia anteriores

Status: done

## Story

As a Secretaría del Distrito,
I want editar un registro de asistencia ya guardado en un módulo,
so that pueda corregir errores de digitación descubiertos después del registro original.

## Acceptance Criteria

1. Al hacer clic en "Corregir" sobre una fila de la tabla de participantes, esa fila entra en modo edición (CI, Nombre, Celular editables).
2. Al guardar los cambios, el registro se actualiza inmediatamente en la tabla.
3. Al hacer clic en el estado "Asistió" de una fila, el valor se alterna (Sí/No) sin entrar en modo edición completo.

## Tasks / Subtasks

- [x] Task 1 (AC: 1,2) — `ParticipantTable.startEdit()`/`saveEdit()` + `ModuleManagementService.updateParticipant()`
- [x] Task 2 (AC: 3) — `ParticipantTable.toggleAttended()`

## Dev Notes

- Edición inline con signals locales del componente (`editingId`, `draft`), no signal-forms (edición de una fila de tabla, no un formulario de alta) — decisión pragmática, documentada aquí por ser una excepción al patrón dominante.

### Project Structure Notes

- `src/app/features/module-management/components/participant-table.ts` (+ `.html`)

### References

- [Source: _bmad-output/planning-artifacts/prds/prd-sistema-dsc-frontend-2026-08-25/prd.md#FR-SEC-03]

### Review Findings

- [x] [Review][Patch] Edición inline no validaba nada (CI/nombre/teléfono podían quedar vacíos o inválidos) [participant-table.ts:saveEdit] — corregido: reutiliza las mismas reglas que el alta manual, con `trim()`.
- [x] [Review][Patch] Faltaba JSDoc en `startEdit`/`cancelEdit`/`saveEdit`/`toggleAttended` — corregido.
- [x] [Review][Patch] Módulo cerrado no bloqueaba edición/asistencia — corregido: `disabled` input gateado por `isRegistrationOpen` (ver también story 1.2).

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Completion Notes List

- Verificado en navegador: "Corregir" habilita edición inline, "Guardar" persiste el cambio en la tabla de inmediato.

### File List

- src/app/features/module-management/components/participant-table.ts
- src/app/features/module-management/components/participant-table.html
- src/app/features/module-management/services/module-management.service.ts
