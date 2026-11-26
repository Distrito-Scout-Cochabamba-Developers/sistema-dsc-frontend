# Sistema DSC — Frontend

Aplicación frontend **Angular 22** (standalone, TypeScript estricto, SCSS global) con arquitectura enterprise **Core / Shared / Features / Layout**. Diseñada para ser **TypeScript-only** en el código de aplicación y tooling (sin `.js` de producto).

## Requisitos previos

| Herramienta | Versión mínima recomendada |
| ----------- | -------------------------- |
| Node.js | 22.12+ (LTS) o 24+/26+ |
| pnpm | 9+ (proyecto usa `pnpm@11`) |
| Angular CLI | 22.x |
| Git | 2.40+ |

```bash
node -v
pnpm -v
```

## Instalación

```bash
pnpm install
pnpm structure   # asegura carpetas enterprise (script TypeScript)
pnpm start       # http://localhost:4200/
```

## Scripts disponibles

| Script | Descripción |
| ------ | ----------- |
| `pnpm start` | Servidor de desarrollo |
| `pnpm build` / `pnpm build:prod` | Build (prod por defecto en `build`) |
| `pnpm watch` | Build continuo (development) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm structure` | Crea/verifica carpetas Core/Shared/Features/Layout/docs (`scripts/setup-app-structure.mts`) |

## Docker (sin instalar Node ni .NET)

Desde la raíz del workspace (`sistema-dsc/`):

```bash
docker compose up --build
```

App en http://localhost:4200. Detalle en el README de esa carpeta.

## API en desarrollo

`pnpm start` proxifica `/api` a `http://localhost:5090`. La API no declara CORS.

Catálogo de módulos: http://localhost:4200/modulos (el formulario se abre al elegir un módulo).

Calendario: http://localhost:4200/calendario (público; inscripción con login). Ver [docs/features/calendario-modulos.md](./docs/features/calendario-modulos.md).

Deep link: http://localhost:4200/asistencia/mod-liderazgo-20241024

El código debe existir como `training_module.code`. En Docker se siembra con `docker/seed-dev-modules.sql`. Ver [docs/features/asistencia-backend-gaps.md](./docs/features/asistencia-backend-gaps.md).

## TypeScript-only

Norma del repositorio:

- **Código de app**: solo `.ts` (plantillas y estilos de componente **inline** en el decorador `@Component`).
- **Prohibido** añadir `.js` / `.jsx` de aplicación (`allowJs: false`).
- **Tailwind CSS v4** en `src/styles.css` (`@import "tailwindcss"` + `@theme`). Config vía `.postcssrc.json` (sin `tailwind.config.js`).
- **Importante:** Tailwind ignora carpetas llamadas `home` al escanear clases; nombrar features como `landing`, `auth`, `dashboard`, etc.
- **SCSS global** complementario en `src/styles.scss` (layout base). Preferir utilidades Tailwind en templates.
- Estilos de componente: utilidades en el `template` o `styles: \`...\`` inline en el `.ts` si hace falta CSS local.
- **Tooling**: scripts en `scripts/*.mts` con Node type-stripping (`node --experimental-strip-types`).
- Schematics CLI: `inlineTemplate` + `inlineStyle`.

> `index.html` es el único HTML de bootstrap exigido por el navegador; no se usan `*.component.html`.

## Arquitectura

```text
src/app/
├── core/           # Singletons (guards, interceptors, services, tokens) — sin UI
├── shared/         # Dumb components, directives, pipes, utils
├── features/       # Dominios lazy-loaded (ej. asistencia/)
├── layout/         # Shell (main-layout)
└── docs/           # Documentación técnica de apoyo embebida
docs/               # Documentación de proyecto (seguimiento, features, ADRs)
docs/adr/           # Architecture Decision Records
docs/seguimiento.md # Tablero de avance (hecho / pendiente)
docs/features/      # Documentación por feature
```

### Alias TypeScript

| Alias | Ruta |
| ----- | ---- |
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@features/*` | `src/app/features/*` |
| `@layout/*` | `src/app/layout/*` |

### Estado y asincronía

- **Signals** → estado local / UI
- **RxJS** → HTTP y streams asíncronos

## Convenciones

1. Solo Standalone Components — sin NgModules.
2. TypeScript `strict` + `strictTemplates`.
3. JSDoc obligatorio en servicios, componentes, interfaces públicas y funciones complejas.
4. Features con `loadChildren` / `loadComponent`.
5. Agentes: seguir el [contrato de desarrollo](./agents.md) y sus referencias según la tarea.

## Documentación para agentes

| Archivo | Rol |
| ------- | --- |
| [`agents.md`](./agents.md) | Contrato de desarrollo (prevalece) |
| [`docs/seguimiento.md`](./docs/seguimiento.md) | Tablero hecho / pendiente |
| [`docs/features/auth-login.md`](./docs/features/auth-login.md) | Login JWT Bearer y guards |
| [`docs/features/modulos-catalogo.md`](./docs/features/modulos-catalogo.md) | Listado `/modulos` y enlace al formulario |
| [`docs/features/catalogo-admin-modulos.md`](./docs/features/catalogo-admin-modulos.md) | Admin `/admin/modulos` |
| [`docs/features/asistencia-registro.md`](./docs/features/asistencia-registro.md) | Feature registro de asistencia |
| [`docs/`](./docs/README.md) | Índice de documentación técnica |
| [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) | Estándares de revisión de UI |
| [`.claude/system-prompt.md`](./.claude/system-prompt.md) | Entrada al contrato para Claude |
| [Skill Angular](./.claude/skills/angular-developer/SKILL.md) | Guía técnica compartida |
| `docs/adr/` | Decisiones arquitectónicas |

## Licencia

Privado — Sistema DSC.
