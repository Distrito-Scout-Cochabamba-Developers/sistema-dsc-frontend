---
name: 'Registro Manual y Corrección de Participantes (Secretaría)'
type: architecture-spine
purpose: build-substrate
altitude: feature
paradigm: 'Standalone Angular, capas Core/Shared/Features/Layout'
scope: 'La feature de gestión de módulos de la Secretaría dentro de sistema-dsc-frontend'
status: final
created: '2026-08-25'
updated: '2026-08-25'
binds: [FR-SEC-01, FR-SEC-02, FR-SEC-03]
sources: ['_bmad-output/planning-artifacts/prds/prd-sistema-dsc-frontend-2026-08-25/prd.md']
companions: []
---

# Architecture Spine — Registro Manual y Corrección de Participantes (Secretaría)

## Design Paradigm

Standalone Angular 22 con capas **Core / Shared / Features / Layout** (heredado de `agents.md`, ya vigente en todo el repo). La nueva feature vive enteramente en `features/module-management/`, sin tocar `core` ni `shared` salvo consumo de utilidades ya existentes (`core/utils/ci.utils.ts`) y componentes ya existentes (`shared/components/state-card.ts`).

## Inherited Invariants

| Inherited | From parent | Binds here |
| --- | --- | --- |
| Capas Core/Shared/Features/Layout | `agents.md` §3 | La feature nueva es un feature más bajo `src/app/features/` |
| Signals para estado local, RxJS para asincronía | `agents.md` §4 | Estado del servicio con `signal`/`computed`; sin `BehaviorSubject` |
| Template inline ≤50 líneas, si no `templateUrl` | `agents.md` §2 / ADR 0003 | Aplica a cada componente nuevo |
| JSDoc obligatorio en toda entidad pública nueva | `agents.md` §5.1 | Servicios, componentes, interfaces de esta feature |
| Formularios con signal-forms (`@angular/forms/signals`) | patrón ya establecido en `attendance-form.ts` | Mismo patrón para alta/edición de participantes |

## Invariants & Rules

### AD-1 — Sin llamadas HTTP en esta iteración

- **Binds:** FR-SEC-01, FR-SEC-02, FR-SEC-03
- **Prevents:** que dos partes de la feature asuman contratos de API distintos antes de que el backend real exista.
- **Rule:** todo el estado vive en `ModuleManagementService` (Signals, en memoria). Ningún componente inyecta `HttpClient` para esta feature. El servicio expone métodos con la misma forma que tendrá la futura API (mismo nombre/parámetros conceptuales), para que el swap a HTTP real sea un cambio de implementación interna, no de superficie pública.

### AD-2 — Ruta y nombre de la feature

- **Binds:** enrutamiento raíz (`app.routes.ts`)
- **Prevents:** ambigüedad entre el nombre en código y la URL visible.
- **Rule:** `[ASSUMPTION]` carpeta `features/module-management/` (inglés, código), ruta `/secretaria` (español, URL) — mismo patrón que `attendance`/`asistencia`. Confirmar con el equipo si el nombre de ruta debe ser otro.

## Consistency Conventions

| Concern | Convention |
| --- | --- |
| Naming | `ModuleEvent`, `ParticipantRecord`, `NewParticipantInput` en `core/models/module-management.models.ts`; sin sufijo en componentes (`ModuleListPage`, no `ModuleListPageComponent`) |
| State & mutación | Un único servicio `providedIn: 'root'` (`ModuleManagementService`) es dueño de los signals de módulos/participantes; los componentes solo leen (`computed`) o llaman métodos del servicio, nunca mutan el signal directamente |
| Formularios | `signal<Model>()` + `form(model, p => {...})` + `[formField]` + validadores reutilizados de `core/utils/ci.utils.ts` |

## Structural Seed

```text
src/app/core/models/module-management.models.ts   # ModuleEvent, ParticipantRecord, NewParticipantInput
src/app/features/module-management/
  module-management.routes.ts
  services/module-management.service.ts
  pages/module-list-page.ts / .html
  pages/module-detail-page.ts / .html
  components/participant-form.ts / .html
  components/participant-table.ts / .html
```

## Capability → Architecture Map

| Capability / Área | Vive en | Gobernado por |
| --- | --- | --- |
| FR-SEC-01 (buscar/seleccionar módulo) | `pages/module-list-page.*` | AD-1, AD-2 |
| FR-SEC-02 (alta manual por CI) | `components/participant-form.*` | AD-1, Inherited (signal-forms) |
| FR-SEC-03 (corregir asistencia) | `components/participant-table.*` | AD-1 |

## Deferred

- Contrato real de API (endpoints .NET) — pushed al momento en que se decida conectar el backend (PRD §6).
- Gate de rol/autenticación real — depende de la historia de "Autenticación", sin criterios definidos aún.
- Persistencia real (hoy el estado se pierde al recargar la página, por ser 100% en memoria) — aceptado mientras no hay backend.
