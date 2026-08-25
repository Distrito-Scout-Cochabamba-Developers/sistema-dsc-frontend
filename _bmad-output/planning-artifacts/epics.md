---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-sistema-dsc-frontend-2026-08-25/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-sistema-dsc-frontend-2026-08-25/ARCHITECTURE-SPINE.md
---

# sistema-dsc-frontend - Epic Breakdown

## Overview

Este documento desglosa en epics e historias el PRD "Registro Manual y Corrección de Participantes por la Secretaría" y su Arquitectura asociada.

## Requirements Inventory

### Functional Requirements

FR-SEC-01: La Secretaría dispone de una vista de gestión de módulos donde puede buscar (por nombre o código) y seleccionar un evento de módulo específico.
FR-SEC-02: La Secretaría puede añadir un participante manualmente ingresando su CI; si el CI ya existe se autocompleta su perfil, si no existe se crea el perfil del dirigente (CI, Nombre, Celular) al mismo tiempo.
FR-SEC-03: La Secretaría puede editar un registro de asistencia ya guardado (CI, Nombre, Celular, si asistió) para corregir errores de digitación.

### NonFunctional Requirements

NFR-01: [ASSUMPTION] Acceso abierto por ahora, sin gate de rol real (depende de historia de Autenticación futura).
NFR-02: Validación de CI reutiliza `CI_NUMBER_PATTERN`/`BOLIVIA_MOBILE_PATTERN` ya existentes en `core/utils/ci.utils.ts`, para consistencia con el formulario de asistencia.
NFR-03: Si el CI ya está enrolado en el mismo módulo, no se crea una fila duplicada — se reutiliza/actualiza la existente.

### Additional Requirements

- AD-1 (Arquitectura): sin `HttpClient` en esta iteración — todo el estado vive en `ModuleManagementService` (Signals, en memoria), con métodos que ya imitan la forma de la futura API.
- AD-2 (Arquitectura): nueva feature `features/module-management/`, ruta `/secretaria`, siguiendo el mismo patrón que `attendance`/`asistencia`.
- Reutilizar patrón de signal-forms de `attendance-form.ts` (form()/FormField/required/pattern/readonly) para los formularios nuevos.
- Reutilizar `shared/components/state-card.ts` para el estado de "módulo no encontrado".
- JSDoc obligatorio en toda entidad pública nueva (agents.md §5.1).

### UX Design Requirements

No aplica — no existe documento UX para este feature (herramienta interna, sin diseño formal previo).

### FR Coverage Map

| FR | Epic.Story |
| --- | --- |
| FR-SEC-01 | 1.1 |
| FR-SEC-02 | 1.2 |
| FR-SEC-03 | 1.3 |

## Epic List

### Epic 1: Gestión de Módulos por Secretaría
Dar a la Secretaría del Distrito una interfaz para buscar módulos, añadir participantes manualmente y corregir registros de asistencia ya guardados.
**FRs covered:** FR-SEC-01, FR-SEC-02, FR-SEC-03

## Epic 1: Gestión de Módulos por Secretaría

Dar a la Secretaría del Distrito una interfaz para buscar módulos, añadir participantes manualmente y corregir registros de asistencia ya guardados, sin depender del dispositivo del participante ni de acceso directo a la base de datos.

### Story 1.1: Buscar y seleccionar módulo-evento

As a Secretaría del Distrito,
I want buscar y seleccionar un módulo-evento específico desde una vista de gestión,
So that pueda luego gestionar la asistencia de sus participantes.

**Acceptance Criteria:**

**Given** la Secretaría entra a la vista de gestión de módulos (`/secretaria`)
**When** escribe texto en el buscador
**Then** la lista se filtra por nombre o código de módulo en tiempo real
**And** si no hay coincidencias, se muestra un mensaje de "no se encontraron módulos"

**Given** la Secretaría ve la lista de módulos
**When** hace clic en un módulo
**Then** navega a la vista de detalle de ese módulo (`/secretaria/:moduleEventId`)

### Story 1.2: Añadir participante manualmente por CI

As a Secretaría del Distrito,
I want añadir un participante a un módulo ingresando su CI,
So that pueda registrar en el sitio a quien no tiene dispositivo móvil.

**Acceptance Criteria:**

**Given** la Secretaría está en la vista de detalle de un módulo
**When** ingresa un CI que ya existe (dirigente conocido) y sale del campo
**Then** el formulario autocompleta Nombre y Celular en modo solo-lectura
**And** muestra un mensaje "Dirigente ya registrado. Se agregará a este módulo."

**Given** la Secretaría ingresa un CI que no existe
**When** sale del campo
**Then** los campos Nombre y Celular quedan vacíos y editables
**And** al enviar el formulario, se crea el perfil del dirigente y se agrega como participante del módulo

**Given** un CI ya está enrolado en el mismo módulo
**When** la Secretaría intenta añadirlo de nuevo
**Then** no se crea una fila duplicada (NFR-03)

### Story 1.3: Corregir registros de asistencia anteriores

As a Secretaría del Distrito,
I want editar un registro de asistencia ya guardado en un módulo,
So that pueda corregir errores de digitación descubiertos después del registro original.

**Acceptance Criteria:**

**Given** la Secretaría ve la tabla de participantes de un módulo
**When** hace clic en "Corregir" sobre una fila
**Then** esa fila entra en modo edición (CI, Nombre, Celular editables)

**Given** la fila está en modo edición
**When** la Secretaría guarda los cambios
**Then** el registro se actualiza inmediatamente en la tabla

**Given** la Secretaría quiere marcar/desmarcar asistencia
**When** hace clic en el estado "Asistió" de una fila
**Then** el valor se alterna (Sí/No) sin necesidad de entrar en modo edición completo
