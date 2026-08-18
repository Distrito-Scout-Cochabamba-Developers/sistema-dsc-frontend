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

## API en desarrollo

`pnpm start` proxifica `/api` a `http://localhost:5090`. La API no declara CORS.

Deep link: http://localhost:4200/asistencia/mod-liderazgo-20241024

El código debe existir como `training_module.code`. Ver [docs/features/asistencia-backend-gaps.md](./docs/features/asistencia-backend-gaps.md).

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
5. Agentes: leer `agents.md`, `.cloude/system-prompt.md`, `_bmad-output/project-context.md` y `docs/seguimiento.md` antes de codificar.

## BMAD Method

Framework de orquestación de agentes (planificación → implementación por historias). Instalado con **pnpm** (no npm/npx):

```bash
pnpm dlx bmad-method@latest install --yes \
  --modules bmm \
  --tools claude-code,cursor \
  --communication-language Spanish \
  --document-output-language Spanish \
  --output-folder _bmad-output \
  --set bmm.project_knowledge=docs \
  --set bmm.user_skill_level=intermediate
```

| Ruta | Uso |
| ---- | --- |
| `_bmad/` | Core + BMM (agentes, workflows, config) |
| `_bmad-output/` | PRDs, architecture, stories, sprint status |
| `_bmad-output/project-context.md` | Contexto brownfield (apunta a `agents.md`) |
| `.claude/skills/` | Skills BMAD para **Claude Code** (equipo) |
| `.agents/skills/` | Skills BMAD para **Cursor** (compartidas) |
| `.cloude/` | Contrato local (`system-prompt` + skill Angular) |
| `.cursor/` | Solo local (gitignored) |

Arranque: en Claude Code o Cursor, invocar **`bmad-help`**.

## Documentación para agentes

| Archivo | Rol |
| ------- | --- |
| [`agents.md`](./agents.md) | Contrato de desarrollo (prevalece) |
| [`docs/seguimiento.md`](./docs/seguimiento.md) | Tablero hecho / pendiente |
| [`docs/features/asistencia-registro.md`](./docs/features/asistencia-registro.md) | Feature registro de asistencia |
| [`docs/`](./docs/README.md) | Índice de documentación técnica |
| [`_bmad-output/project-context.md`](./_bmad-output/project-context.md) | Contexto BMAD / brownfield |
| [`.cloude/system-prompt.md`](./.cloude/system-prompt.md) | System prompt obligatorio |
| [`.cloude/angular-developer/`](./.cloude/angular-developer/SKILL.md) | Skill de Angular compartida |
| `_bmad/` | Workflows y agentes BMAD |
| `docs/adr/` | Decisiones arquitectónicas |

## Licencia

Privado — Sistema DSC.
