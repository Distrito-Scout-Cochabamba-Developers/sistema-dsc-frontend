# 0003. Templates/estilos separados y convenciones de nombres (Angular 22)

- Estado: Accepted
- Fecha: 2026-08-05
- Decisores: Equipo frontend DSC

## Contexto

`agents.md` §2 prohibía `templateUrl`/`styleUrl` (todo inline en el `.ts`), como excepción documentada en su momento para forzar componentes pequeños y evitar archivos huérfanos. Al construir la feature `asistencia` se evaluó el costo real de esa regla: templates inline de 150-230 líneas en componentes con lógica no trivial (`asistencia-form`), sin beneficio funcional medible frente al patrón de archivos separados.

Se evaluó la guía ["Angular v22 Folder Structure Guide: Best Practices for Scalable Apps"](https://blog.simplified.courses — Gerome Grignon), vigente para el proyecto (Angular **22**), que resume las convenciones actuales del style guide oficial de Angular:

- Componentes/Directivas/Servicios: **sin sufijo** en clase ni archivo (`Notification` en `notification.ts`, no `NotificationComponent`/`notification.component.ts`).
- Guards/Pipes/Interceptors/Resolvers: mantienen sufijo en la clase, separado por **guion** en el archivo (`auth-guard.ts`, no `auth.guard.ts`).
- Cada feature con **múltiples** rutas usa una carpeta `pages/`; features de una sola ruta no la necesitan.
- `.html`/`.css` separados del `.ts` (patrón CLI por defecto), favoreciendo escalabilidad de equipo y tooling maduro sobre la co-ubicación inline.

## Decisión

1. **Se revierte la prohibición de `templateUrl`** de `agents.md` §2, pero **no de forma absoluta**: se adopta un **umbral de 50 líneas**. Un template de 50 líneas o menos se queda **inline**; por encima de 50 líneas, se extrae a `.html` propio vía `templateUrl`. No se fuerza la migración de componentes pequeños solo por consistencia cosmética.
2. **`.css` de componente**: no se usa en ningún caso actual (Tailwind cubre el 100% de los estilos); solo se crearía ante una necesidad real futura.
3. **Servicios**: se evalúa quitar el sufijo `.service` del nombre de archivo (ver Nota) cuando el archivo ya vive en una carpeta `services/` que lo hace obvio por ubicación.
4. **Componentes ya sin sufijo** (ya cumplido: `AsistenciaPage`, `StateCard`, etc. — no requieren cambio).
5. Estructura `pages/` se adopta **solo** cuando una feature tenga más de una ruta; `asistencia` hoy tiene una sola (`AsistenciaPage`), no se crea `pages/` todavía.

### Componentes migrados vs. que se quedan inline (con el corte en 50 líneas)

| Se queda inline (≤50 líneas) | Se migra a `.html` (>50 líneas) |
| --- | --- |
| `app.ts` (7), `dsc-logo-badge.ts` (9), `footer-link-group.ts` (10), `summary-list.ts` (11), `state-card.ts` (14), `landing.ts` (27), `asistencia-success.ts` (30) | `asistencia-page.ts` (69), `main-layout.ts` (79), `asistencia-form.ts` (166) |

### Nota sobre el sufijo `Service`

Se evaluó quitar el sufijo `Service` de las clases (`AuthSessionService` → `AuthSession`) siguiendo la guía al pie de la letra. Se decide **mantener el sufijo en la clase** (`AuthSessionService`) pero sin `.service` en el nombre de archivo cuando el archivo ya vive en una carpeta `services/` — esto es una adaptación local, no la regla literal del artículo, para no perder legibilidad al inyectar (`inject(AuthSessionService)` es más claro fuera de contexto que `inject(AuthSession)`). Justificación: la guía es una referencia externa, no el estilo oficial obligatorio de Angular; se adopta lo que aporta valor real (separación de archivos, `pages/`) y se ajusta lo que reduce claridad sin beneficio medible.

## Consecuencias

- Migración de 3 componentes que superan el umbral (`asistencia-page`, `main-layout`, `asistencia-form`) a `.html`. Los 7 restantes se quedan inline por estar dentro del límite.
- `agents.md` actualizado (§2, §6, §7) para reflejar la norma del umbral de 50 líneas.
- Sin cambio de comportamiento: build y suite de tests (11/11) deben seguir pasando igual tras la migración.
- Todo componente nuevo se evalúa contra el mismo umbral (50 líneas) antes de decidir inline vs. `.html`; no es una regla absoluta de "siempre separado".
