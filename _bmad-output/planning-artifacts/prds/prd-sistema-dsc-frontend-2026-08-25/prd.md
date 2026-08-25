---
title: Registro Manual y Corrección de Participantes por la Secretaría
status: final
created: 2026-08-25
updated: 2026-08-25
---

# PRD — Registro Manual y Corrección de Participantes por la Secretaría

## 1. Contexto

Sistema DSC ya permite que un participante registre su propia asistencia a un módulo vía link/QR (feature `attendance`, ver `docs/seguimiento.md` sección 2). Ese flujo depende de que el participante tenga un dispositivo móvil y digite su propio CI correctamente.

En la práctica hay dos casos que ese flujo no cubre:

1. Participantes sin dispositivo móvil en el sitio del módulo.
2. Errores de digitación de CI descubiertos después del hecho (ej. un dígito mal tipeado durante el registro).

Ambos casos hoy requieren intervención manual de la **Secretaría del Distrito**, para lo cual no existe ninguna interfaz — la corrección hoy solo sería posible editando la base de datos directamente.

Este PRD cubre una nueva capacidad para que la Secretaría gestione manualmente la asistencia de un módulo: buscar el módulo, añadir participantes a mano, y corregir registros ya guardados.

**Fuente:** work item de Azure DevOps *"Registro Manual y Corrección de Participantes por la Secretaría"* (texto completo provisto por el usuario).

**Nota de continuidad:** el código ya anticipa esta historia — `src/app/core/models/attendance.models.ts:13` referencia `FR-SEC-02/03` al documentar por qué el estado de asistencia (`AttendanceRegistrationStatus`) es provisional. Este PRD adopta esa numeración.

## 2. Objetivo

Dar a la Secretaría del Distrito una vía para registrar y corregir asistencia a módulos sin depender del dispositivo del participante ni de acceso directo a la base de datos.

**Fuera de alcance de este PRD (ver §6):** el backend real (endpoints de listar módulos, crear dirigente, registrar/editar asistencia) y la autenticación real por rol. Ambos son dependencias futuras, no bloqueantes para esta historia — **[ASSUMPTION]** se construye primero el frontend con datos de ejemplo, mismo patrón que ADR 0001 (mocks antes de API) usado en la historia de registro de asistencia.

## 3. Usuarios

- **Secretaría del Distrito** (única persona operadora de esta feature): personal administrativo del distrito scout, responsable de la exactitud de los registros de asistencia a módulos de formación.

No hay otros roles que interactúen con esta interfaz.

## 4. Requisitos Funcionales

### FR-SEC-01 — Buscar y seleccionar módulo-evento

La Secretaría dispone de una vista de gestión de módulos donde puede buscar (por nombre o código) y seleccionar un evento de módulo específico para gestionarlo.

### FR-SEC-02 — Añadir participante manualmente por CI

Desde el módulo seleccionado, la Secretaría puede añadir un participante ingresando su CI.
- Si el CI ya existe (dirigente conocido), se autocompleta su perfil (Nombre, Celular) y se agrega al módulo.
- Si el CI no existe, la interfaz permite crear el perfil del dirigente (CI, Nombre, Celular) al mismo tiempo que se le añade al módulo.

### FR-SEC-03 — Corregir registros de asistencia anteriores

La Secretaría puede editar un registro de asistencia ya guardado en un módulo (CI, Nombre, Celular, si asistió) para corregir errores de digitación descubiertos después del registro original.

## 5. Requisitos No Funcionales / Reglas de negocio

- **NFR-01 (Acceso):** **[ASSUMPTION]** sin gate de rol real por ahora — la vista queda abierta como el resto de la demo, igual que `AuthSessionService` (mock). Se revisita cuando exista autenticación real (bloqueada hoy, ver `docs/seguimiento.md` A-11).
- **NFR-02 (Validación de CI):** reutilizar la misma regla de formato de CI ya usada en `attendance-form` (`CI_NUMBER_PATTERN`, `core/utils/ci.utils.ts`) para consistencia — aunque esa regla tiene un bug conocido y ya reportado (no coincide con el formato real boliviano de 6-8 dígitos). No se corrige aquí; mismo comportamiento en ambos formularios.
- **NFR-03 (Sin duplicados evidentes):** si el CI ya está enrolado en el mismo módulo, no se debe crear una fila duplicada — se reutiliza/actualiza la existente.

## 6. Fuera de alcance / Dependencias futuras

- Backend real (endpoints .NET/EF Core para listar `TrainingModuleSession`, crear/actualizar `TrainingModuleEnrollment`) — **[ASSUMPTION]** queda fuera de esta historia; requiere trabajo de backend separado, documentado si se decide conectar.
- Autenticación real por rol — depende de la historia de "Autenticación", hoy sin criterios de aceptación definidos.
- i18n, auditoría formal (quién hizo cada corrección) — no solicitado en los 3 criterios originales.

## 7. Preguntas abiertas

- ¿Quién audita/aprueba una corrección hecha por Secretaría? (no especificado en los criterios originales — asumido: no requerido para esta historia).
- ¿El backend futuro reutiliza `TrainingModuleEnrollment`/`training_module_enrollment` (recomendado, ver hallazgos de arquitectura) o el mecanismo `ModuleAttendance` existente? Decisión pendiente para cuando se conecte el backend.
