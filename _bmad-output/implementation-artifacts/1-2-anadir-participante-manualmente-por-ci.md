# Story 1.2: Añadir participante manualmente por CI

Status: done

## Story

As a Secretaría del Distrito,
I want añadir un participante a un módulo ingresando su CI,
so that pueda registrar en el sitio a quien no tiene dispositivo móvil.

## Acceptance Criteria

1. Si el CI ya existe (dirigente conocido), el formulario autocompleta Nombre y Celular en modo solo-lectura, con mensaje "Dirigente ya registrado. Se agregará a este módulo."
2. Si el CI no existe, los campos Nombre y Celular quedan vacíos y editables.
3. Al enviar el formulario con un CI nuevo, se crea el perfil del dirigente y se agrega como participante del módulo.
4. Si el CI ya está enrolado en el mismo módulo, no se crea una fila duplicada (NFR-03).

## Tasks / Subtasks

- [x] Task 1 (AC: 1,2) — `ParticipantForm.onCiBlur()` + `ModuleManagementService.findByCi()`
- [x] Task 2 (AC: 3) — `ParticipantForm.onSubmit()` + `ModuleManagementService.addParticipant()`
- [x] Task 3 (AC: 1) — campo Nombre en modo readonly vía `readonly(p.fullName, { when: ... })` (signal-forms), no vía `[readonly]` directo (no permitido con `[formField]`)

## Dev Notes

- Reutiliza `CI_NUMBER_PATTERN`/`BOLIVIA_MOBILE_PATTERN` de `core/utils/ci.utils.ts` (NFR-02).
- Patrón signal-forms igual que `attendance-form.ts`: `signal<Model>()` + `form(model, p => {...})` + `[formField]`.
- Hallazgo técnico: `[readonly]`/`[attr.readonly]` no se pueden bindear directamente en un input con `[formField]` (error NG8022) — usar la función oficial `readonly()` del schema de signal-forms en su lugar.

### Project Structure Notes

- `src/app/features/module-management/components/participant-form.ts` (+ `.html`)

### References

- [Source: _bmad-output/planning-artifacts/prds/prd-sistema-dsc-frontend-2026-08-25/prd.md#FR-SEC-02]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-sistema-dsc-frontend-2026-08-25/ARCHITECTURE-SPINE.md#Inherited-Invariants]

### Review Findings

- [x] [Review][Patch] Sin guardia contra CI duplicado en el mismo módulo (viola NFR-03) [module-management.service.ts:addParticipant] — corregido: reutiliza/actualiza el registro existente en vez de duplicar.
- [x] [Review][Patch] Teléfono no quedaba readonly cuando el CI ya existía (viola AC1) [participant-form.ts] — corregido: `readonly(p.phone, ...)` igual que `fullName`.
- [x] [Review][Patch] `foundExisting` podía quedar obsoleto si el CI cambiaba sin blur [participant-form.ts] — corregido: ahora es un `computed` derivado del CI actual.
- [x] [Review][Patch] `enrollmentId` con `Date.now()` podía colisionar [module-management.service.ts] — corregido: se agrega sufijo aleatorio.
- [x] [Review][Decision→Patch] Módulo cerrado no bloqueaba alta — decisión: sí bloquear. Corregido: `disabled` input en `ParticipantForm`/`ParticipantTable`, gateado por `isRegistrationOpen`.
- [x] [Review][Patch] `NewParticipantInput` no era `readonly` a diferencia de sus hermanas — corregido.
- [x] [Review][Patch] Comentario del servicio sobreestimaba la facilidad de conectar HTTP real — reescrito.
- [x] [Review][Defer] Sin acción de "eliminar" un participante mal agregado [Review]/Defer — deferred, fuera del alcance de los 3 criterios originales.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Completion Notes List

- Verificado en navegador: CI existente autocompleta y bloquea edición de nombre; CI nuevo permite crear perfil y lo agrega a la tabla; formulario se limpia tras guardar.

### File List

- src/app/features/module-management/components/participant-form.ts
- src/app/features/module-management/components/participant-form.html
- src/app/features/module-management/services/module-management.service.ts
