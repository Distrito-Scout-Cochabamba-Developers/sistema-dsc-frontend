# Seguimiento del proyecto

- **Última actualización:** 2026-11-15
- **Estado general:** Login **JWT Bearer**. Catálogo de módulos en `/modulos`. Asistencia pública. Calendario `/calendario` (UI + fixtures; API de programaciones pendiente). Registro **según rol** espera `[Authorize]` en attendance. Logout API y Google pendientes.

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
| F-05 | Contratos de agentes | Hecho | [Contrato y referencias](../agents.md) |
| F-07 | Extensiones / settings VS Code (Angular + Tailwind) | Hecho | `.vscode/extensions.json`, `.vscode/settings.json` |
| F-08 | Documentación de seguimiento en `docs/` | Hecho | Este archivo + feature asistencia |

---

## 2. Feature: Registro de asistencia a módulo

User story: *Como Dirigente Scout (Participante), quiero registrar mi asistencia a un módulo ingresando mis datos desde el dispositivo…*

Detalle: [features/asistencia-registro.md](./features/asistencia-registro.md) · Contrato: [features/contrato-api-asistencia.md](./features/contrato-api-asistencia.md) · Gaps: [features/asistencia-backend-gaps.md](./features/asistencia-backend-gaps.md) · Roles: [features/asistencia-registro-por-rol.md](./features/asistencia-registro-por-rol.md)

| ID | Criterio / tarea | Estado | Notas |
| -- | ---------------- | ------ | ----- |
| A-01 | UI alineada al diseño (navbar, form, sidebar, footer) | Hecho | Ruta `/asistencia/:sessionId` |
| A-02 | Acceso por link directo / QR (param `sessionId`) | Hecho | Código = `TrainingModule.Code`. Catálogo de módulos: `/modulos` |
| A-18 | Listar módulos desde BD; formulario solo al elegir uno | Hecho | `GET /api/attendance/modules` + feature `modules/` |
| A-03 | Campos obligatorios: Nombre, Carnet de Identidad, Extensión, Teléfono | Hecho | Signal Forms |
| A-04 | Validación numérica de Carnet de Identidad (7–10 dígitos) | Hecho | UI 7–10; API acepta 4–10 |
| A-05 | Autocomplete de nombre si Carnet de Identidad existe en directorio | Hecho | `GET api/attendance/lookup-ci/{ci}` |
| A-06 | Mensaje de éxito con resumen del módulo | Hecho | `ModuleAttendanceResultDto` |
| A-07 | Prefill si dirigente autenticado | Bloqueado | `/me` no trae CI/teléfono; ver registro por rol (A-16) |
| A-08 | Registro parcial si no está en el sistema | Hecho | 404 lookup + `isPartialRegistration` |
| A-09 | Conectar lookup Carnet de Identidad a API real | Hecho | `AdultDirectoryService` |
| A-10 | Conectar registro a API real | Hecho | `AttendanceRegistrationService` |
| A-11 | Auth real (login / token / sesión) | Hecho | JWT Bearer `POST /api/v1/auth/login`, Signals, interceptor, guards. Logout API pendiente |
| A-12 | Generación/consumo de QR de sesión | En curso | **Consumo hecho** (deep link + QR local). **Generación admin bloqueada**. |
| A-13 | Tests unitarios de la página / validaciones | Hecho | Página + HTTP + utils |
| A-14 | Estados de error de red / retry UX | Hecho | Problem Details, retry GET 5xx, botones Reintentar |
| A-15 | Accesibilidad (ARIA labels, foco, contraste) | Hecho | Labels, `aria-invalid`, skip link, foco al primer error |
| A-16 | Usuario normal: solo autoinscripción + prefill de su persona | Bloqueado | API anónima y `/me` sin ficha. Doc: [asistencia-registro-por-rol.md](./features/asistencia-registro-por-rol.md) |
| A-17 | Admin/secretaría: registrar a terceros en un módulo | Bloqueado | Roles en JWT ya existen; falta `[Authorize]` en attendance |

---

## 3. Integración backend (bloqueante para producción)

| ID | Ítem | Estado | Dependencia |
| -- | ---- | ------ | ----------- |
| B-01 | Contrato OpenAPI / DTOs de adultos y asistencia | Hecho | Contrato real documentado; OpenAPI en Development del backend no genera cliente |
| B-02 | `HttpClient` + interceptores (auth, errores) | Hecho | `withFetch`, `authInterceptor`, `httpRetryInterceptor` |
| B-03 | Environments (`apiBaseUrl` dev/prod) | Hecho | `src/environments` + proxy local |
| B-04 | Manejo de errores HTTP tipados | Hecho | RFC 7807 `detail` + `status === 0` |
| B-05 | CORS / cookies / refresh token (según diseño) | En curso | Auth es Bearer (no cookie). **CORS no está en `Program.cs`**. Sin logout ni refresh. |

---

## 4. Producto / otras features (roadmap)

| ID | Ítem | Estado | Notas |
| -- | ---- | ------ | ----- |
| P-01 | Landing pública real (contenido DSC) | Pendiente | Placeholder con CTA a `/modulos` |
| P-02 | Calendario de módulos | En curso | UI `/calendario` + inscripción 409. API pendiente. [calendario-modulos.md](./features/calendario-modulos.md) |
| P-03 | Mapa / ubicaciones | Pendiente | Link deshabilitado en nav |
| P-04 | Iniciar sesión (pantalla real) | Hecho | **Completado.** Google/registro de cuenta deshabilitados (gaps de API) |
| P-05 | Área de facilitador (generar QR / lista de asistentes) | Pendiente | Fuera de alcance del participante |
| P-07 | Admin catálogo de módulos de módulos (CRUD) | Hecho | GET/POST/PUT/DELETE admin + tipos. [catalogo-admin-modulos.md](./features/catalogo-admin-modulos.md) |
| P-06 | i18n (es / otros) | Pendiente | Copy actual en español fijo |

---

## 5. Calidad y DevOps

| ID | Ítem | Estado | Notas |
| -- | ---- | ------ | ----- |
| Q-01 | ESLint + reglas Angular | Hecho | `pnpm lint`: 0 errores, 0 avisos (2026-11-24) |
| Q-02 | Integración continua (lint + build + test en PR) | En curso | `.github/workflows/pr-validation.yml` creado; no probado en GitHub ni marcado como obligatorio en `main` |
| Q-03 | Coverage mínimo en features críticas | Pendiente | — |
| Q-05 | Primer ADR formal (mocks vs API) | Hecho | ADR 0001–0007 |

### Retro 2026-11 (evidencia)

| Prioridad | Ítem | Estado | Evidencia |
| --------- | ---- | ------ | --------- |
| P0 | Pruebas de Secretaría | Hecho | Helpers distinguen el formulario de filtros del de búsqueda por Carnet de Identidad; `ng test`: 135/135 |
| P0 | ESLint y validación de PR | En curso | Script `lint` con 0 errores; workflow creado, pendiente de ejecutar en GitHub |
| P1 | Menú hamburguesa móvil | Hecho | Botón «Menú» con `aria-expanded`/`aria-controls`, cierre al navegar y con Escape; sidebar en escritorio |
| P1 | Flujo móvil del dirigente | En curso | Perfil `mobile-chromium` (Pixel 7). Sin sesión: pasa. Con sesión: requiere `E2E_DIRIGENTE_IDENTIFIER/PASSWORD`, aún no ejecutada |
| P1 | Jerarquía visual y reutilización | Hecho | Calendario en Lista por defecto en móvil (primer «Inscribirme» en y≈505 de 839, antes y≈1114); confirmación con `role="status"`; diálogo con `aria-labelledby`; encabezado con sesión en una línea (65 px, antes 117 px); Calendario primero en el menú móvil y atajo «Ir al calendario» en Módulos; azul de texto y botones en `dsc-primary-hover`/`dsc-dark` (≥5,9:1). Secretaría usa `app-text-field`, `app-date-picker` y `app-button` con una acción principal por paso. Capturas móvil 412×839 y escritorio 1280×800 revisadas |

Pendientes de la retro:

- `e2e/attendance.spec.ts:30` falla: la sesión `SCOUT_METHOD_AND_PROGRAM` no está en los datos.
- Confirmar si quitar Google y el registro del login fue intencional.
- Marcar el check de PR como obligatorio en `main`.
- Ejecutar el E2E móvil con sesión de dirigente.
- `app-date-picker` muestra dos iconos de calendario (el propio y el nativo).
- Botones locales de `training-catalog` aún sin migrar a `app-button` (solo se corrigió el contraste).

---

## Cómo probar lo actual

Arrancar la API (`http://localhost:5090`) y el frontend:

```bash
pnpm install
pnpm start
```

- Inicio: http://localhost:4200/
- Módulos: http://localhost:4200/modulos
- Calendario: http://localhost:4200/calendario (fixtures hasta que exista la API)
- Login: http://localhost:4200/auth/login
- Registro (tras elegir un módulo): http://localhost:4200/asistencia/mod-liderazgo-20241024
- Proxy `/api` → `:5090` (la API no tiene CORS; reescribe cookie a `localhost`)
- Carnet de Identidad conocido: el que exista en `person.id_card`
- Carnet de Identidad desconocido: 7–10 dígitos → registro parcial si existe el `TrainingModule.Code`
- Duplicado → 409
- Auth: `POST /api/v1/auth/login` con `{ identifier, password }`. JWT en el body. Usuarios de seeder (`pablo.rocha`, `maricel.rocha`, …). Contraseña local Docker: `1234`.

Docker siembra `module_type` + 4 `training_module` (`docker/seed-dev-modules.sql`). Un código que no exista muestra «Sesión no válida» (sin formulario).

---

## Próximo paso sugerido (backend / producto)

1. Registro a módulos según rol (A-16/A-17): Authorize + `/me` con persona. Ver [asistencia-registro-por-rol.md](./features/asistencia-registro-por-rol.md).
2. Logout que invalide el JWT y CORS o reverse proxy same-origin (B-05).
3. Definir si el QR usa `Code` o `QrToken`.
4. ~~GET/POST de calendario~~ entregado (2026-11-21). `trainingCalendarApiEnabled: true`.
5. GET de programación (fecha/horario) si el catálogo de módulos deja de ser el módulo curricular.
