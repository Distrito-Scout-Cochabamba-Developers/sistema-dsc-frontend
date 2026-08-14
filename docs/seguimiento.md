# Seguimiento del proyecto

- **Última actualización:** 2026-08-04
- **Estado general:** Scaffold Angular listo; primera feature de dominio (`asistencia`) en UI mock sin backend.

Este archivo es el tablero de seguimiento. Márcalo al avanzar (cambia `Pendiente` → `En curso` → `Hecho`).

---

## Leyenda

| Estado | Significado |
| ------ | ----------- |
| Hecho | Entregado y usable en el repo |
| En curso | Trabajo activo |
| Pendiente | No iniciado o bloqueado (suele depender de backend/producto) |
| Bloqueado | Espera dependencia externa |

---

## 1. Fundación del frontend

| ID | Ítem | Estado | Notas |
| -- | ---- | ------ | ----- |
| F-01 | Proyecto Angular 22 (standalone, routing, SCSS, strict TS) | Hecho | `pnpm` como package manager |
| F-02 | Arquitectura Core / Shared / Features / Layout | Hecho | Alias `@core`, `@shared`, `@features`, `@layout` |
| F-03 | TypeScript-only + templates/styles inline | Hecho | Schematics en `angular.json` |
| F-04 | Tailwind CSS v4 + tema DSC | Hecho | `src/styles.css` + `.postcssrc.json` |
| F-05 | Contratos de agentes (`agents.md`, `.cloude/`) | Hecho | Skill Angular en `.cloude/angular-developer/` |
| F-06 | BMAD Method (BMM) instalado | Hecho | `_bmad/`, skills en `.claude/` y `.agents/` |
| F-07 | Extensiones / settings VS Code (Angular + Tailwind) | Hecho | `.vscode/extensions.json`, `.vscode/settings.json` |
| F-08 | Documentación de seguimiento en `docs/` | Hecho | Este archivo + feature asistencia |

---

## 2. Feature: Registro de asistencia a módulo

User story: *Como Dirigente Scout (Participante), quiero registrar mi asistencia a un módulo ingresando mis datos desde el dispositivo…*

Detalle: [features/asistencia-registro.md](./features/asistencia-registro.md)

| ID | Criterio / tarea | Estado | Notas |
| -- | ---------------- | ------ | ----- |
| A-01 | UI alineada al diseño (navbar, form, sidebar, footer) | Hecho | Ruta `/asistencia/:sessionId` |
| A-02 | Acceso por link directo / QR (param `sessionId`) | Hecho | Demo: `mod-liderazgo-20241024` |
| A-03 | Campos obligatorios: Nombre, CI, Extensión, Teléfono | Hecho | Signal Forms |
| A-04 | Validación numérica de CI (7–10 dígitos) | Hecho | Mock en frontend |
| A-05 | Autocomplete de nombre si CI existe en directorio | Hecho | Mock: `12345678`, `87654321` |
| A-06 | Mensaje de éxito con resumen del módulo | Hecho | Pantalla de confirmación |
| A-07 | Prefill si dirigente autenticado | Hecho | `AuthSessionService` mock |
| A-08 | Registro parcial si no está en el sistema | Hecho | Flag `partialRegistration` |
| A-09 | Conectar lookup CI a API real | Pendiente | Reemplazar `AdultosDirectoryService` |
| A-10 | Conectar registro a API real | Pendiente | Reemplazar `AsistenciaRegistroService` |
| A-11 | Auth real (login / token / sesión) | Pendiente | Hoy toggle demo en navbar |
| A-12 | Generación/consumo de QR de sesión (backend o admin) | Pendiente | Frontend solo consume el deep link |
| A-13 | Tests unitarios de la página / validaciones | Hecho | `asistencia-page.spec.ts`, 11/11 tests (sesión inválida, autocompletado, registro parcial, validaciones CI/teléfono, flujo de éxito) |
| A-14 | Estados de error de red / retry UX | Pendiente | Tras API |
| A-15 | Accesibilidad (ARIA labels, foco, contraste) | En curso | `aria-invalid`/`aria-describedby` en los 4 campos del formulario; falta auditoría de contraste/foco completa |

---

## 3. Integración backend (bloqueante para producción)

| ID | Ítem | Estado | Dependencia |
| -- | ---- | ------ | ----------- |
| B-01 | Contrato OpenAPI / DTOs de adultos y asistencia | En curso | Propuesta documentada en [ADR 0002](./adr/0002-contrato-api-asumido-registro-asistencia.md); falta validación del Architect backend |
| B-02 | `HttpClient` + interceptores (auth, errores) | Pendiente | Tras B-01 |
| B-03 | Environments (`apiBaseUrl` dev/prod) | Pendiente | — |
| B-04 | Manejo de errores HTTP tipados | Pendiente | B-02 |
| B-05 | CORS / cookies / refresh token (según diseño) | Pendiente | Backend |

---

## 4. Producto / otras features (roadmap)

| ID | Ítem | Estado | Notas |
| -- | ---- | ------ | ----- |
| P-01 | Landing pública real (contenido DSC) | Pendiente | Hoy es placeholder con CTA al demo |
| P-02 | Calendario de módulos | Pendiente | Link deshabilitado en nav |
| P-03 | Mapa / ubicaciones | Pendiente | Link deshabilitado en nav |
| P-04 | Iniciar sesión (pantalla real) | Pendiente | Hoy mock en shell |
| P-05 | Área de facilitador (generar QR / lista de asistentes) | Pendiente | Fuera de alcance del participante |
| P-06 | i18n (es / otros) | Pendiente | Copy actual en español fijo |

---

## 5. Calidad y DevOps

| ID | Ítem | Estado | Notas |
| -- | ---- | ------ | ----- |
| Q-01 | ESLint + reglas Angular | Pendiente | — |
| Q-02 | CI (build + test en PR) | Pendiente | — |
| Q-03 | Coverage mínimo en features críticas | Pendiente | — |
| Q-04 | Instalar `uv` (recomendado por BMAD) | Pendiente | Opcional para workflows Python |
| Q-05 | Primer ADR formal (mocks vs API) | Hecho | [ADR 0001](./adr/0001-mocks-frontend-antes-de-api.md), [ADR 0002](./adr/0002-contrato-api-asumido-registro-asistencia.md), [ADR 0003](./adr/0003-templates-separados-y-convenciones-v20.md) |

---

## Cómo probar lo actual

```bash
pnpm install
pnpm start
```

- Inicio: http://localhost:4200/
- Registro demo: http://localhost:4200/asistencia/mod-liderazgo-20241024
- CI con autocomplete: `12345678` o `87654321`
- CI desconocido: cualquier otro numérico válido → registro parcial
- Auth demo: botón **Iniciar Sesión** / **Cerrar sesión** en el navbar

---

## Próximo paso sugerido

1. Definir contrato API con backend (B-01).
2. Sustituir mocks de `AdultosDirectoryService` y `AsistenciaRegistroService` (A-09, A-10).
3. Añadir tests de la feature `asistencia` (A-13).
4. Abrir PRD/epic BMAD si el alcance crece (`bmad-help` / `bmad-create-prd`).
