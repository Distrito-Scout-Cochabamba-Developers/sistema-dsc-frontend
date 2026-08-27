# Seguimiento del proyecto

- **Última actualización:** 2026-08-18
- **Estado general:** Feature `attendance` conectada a lookup y POST de la API DSC. Auth, CORS y GET de sesión siguen pendientes en backend.

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

Detalle: [features/asistencia-registro.md](./features/asistencia-registro.md) · Contrato: [features/contrato-api-asistencia.md](./features/contrato-api-asistencia.md) · Gaps: [features/asistencia-backend-gaps.md](./features/asistencia-backend-gaps.md)

| ID | Criterio / tarea | Estado | Notas |
| -- | ---------------- | ------ | ----- |
| A-01 | UI alineada al diseño (navbar, form, sidebar, footer) | Hecho | Ruta `/asistencia/:sessionId` |
| A-02 | Acceso por link directo / QR (param `sessionId`) | Hecho | Demo: `mod-liderazgo-20241024` |
| A-03 | Campos obligatorios: Nombre, CI, Extensión, Teléfono | Hecho | Signal Forms |
| A-04 | Validación numérica de CI (7–10 dígitos) | Hecho | UI 7–10; API acepta 4–10 |
| A-05 | Autocomplete de nombre si CI existe en directorio | Hecho | `GET api/attendance/lookup-ci/{ci}` |
| A-06 | Mensaje de éxito con resumen del módulo | Hecho | `ModuleAttendanceResultDto` |
| A-07 | Prefill si dirigente autenticado | Hecho | Solo perfil demo del navbar (sin JWT) |
| A-08 | Registro parcial si no está en el sistema | Hecho | 404 lookup + `isPartialRegistration` |
| A-09 | Conectar lookup CI a API real | Hecho | `AdultDirectoryService` |
| A-10 | Conectar registro a API real | Hecho | `AttendanceRegistrationService` |
| A-11 | Auth real (login / token / sesión) | Bloqueado | La API no expone login/JWT. Interceptor Bearer listo. Toggle demo. |
| A-12 | Generación/consumo de QR de sesión | En curso | **Consumo hecho** (deep link + QR local). **Generación admin bloqueada**. |
| A-13 | Tests unitarios de la página / validaciones | Hecho | Página + HTTP + utils |
| A-14 | Estados de error de red / retry UX | Hecho | Problem Details, retry GET 5xx, botones Reintentar |
| A-15 | Accesibilidad (ARIA labels, foco, contraste) | Hecho | Labels, `aria-invalid`, skip link, foco al primer error |

---

## 3. Integración backend (bloqueante para producción)

| ID | Ítem | Estado | Dependencia |
| -- | ---- | ------ | ----------- |
| B-01 | Contrato OpenAPI / DTOs de adultos y asistencia | Hecho | Contrato real documentado; OpenAPI en Development del backend no genera cliente |
| B-02 | `HttpClient` + interceptores (auth, errores) | Hecho | `withFetch`, `authInterceptor`, `httpRetryInterceptor` |
| B-03 | Environments (`apiBaseUrl` dev/prod) | Hecho | `src/environments` + proxy local |
| B-04 | Manejo de errores HTTP tipados | Hecho | RFC 7807 `detail` + `status === 0` |
| B-05 | CORS / cookies / refresh token (según diseño) | Bloqueado | **CORS no está en `Program.cs`**. Dev: proxy. No hay cookies ni refresh. |

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
| Q-05 | Primer ADR formal (mocks vs API) | Hecho | ADR 0001–0004 |

---

## Cómo probar lo actual

Arrancar la API (`http://localhost:5090`) y el frontend:

```bash
pnpm install
pnpm start
```

- Inicio: http://localhost:4200/
- Registro: http://localhost:4200/asistencia/mod-liderazgo-20241024
- Proxy `/api` → `:5090` (la API no tiene CORS)
- CI conocido: el que exista en `person.id_card`
- CI desconocido: 7–10 dígitos → registro parcial si existe el `TrainingModule.Code`
- Duplicado → 409
- Auth demo: navbar (no llama a la API)

Si el POST da 404, falta `training_module.code = mod-liderazgo-20241024`.

---

## Próximo paso sugerido (backend / producto)

1. CORS o reverse proxy same-origin (B-05).
2. GET de sesión/convocatoria y semilla del módulo demo.
3. Definir si el QR usa `Code` o `QrToken`.
4. Login real (A-11 / P-04).
