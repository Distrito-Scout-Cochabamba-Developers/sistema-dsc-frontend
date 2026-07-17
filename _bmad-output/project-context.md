# Project Context — Sistema DSC Frontend

> Archivo de contexto para agentes BMAD y otros LLMs.
> **Ante cualquier conflicto, gana [`agents.md`](../agents.md) (raíz del repo).**

## Stack

- Angular **22**, standalone components, TypeScript **strict**, Tailwind CSS **v4**
- Package manager: **pnpm** (no npm/npx en scripts de proyecto; usar `pnpm` / `pnpm dlx`)
- Testing: Vitest vía `pnpm test`
- Build: `pnpm build`

## Arquitectura (obligatoria)

```text
src/app/core/      → Singletons (guards, interceptors, services, tokens). SIN UI.
src/app/shared/    → Dumb components, directives, pipes, utils. Sin lógica de negocio.
src/app/features/  → Dominios lazy-loaded (loadComponent / loadChildren).
src/app/layout/    → Shell (navbar, footer, router-outlet).
docs/adr/          → Architecture Decision Records.
```

Alias: `@core/*`, `@shared/*`, `@features/*`, `@layout/*`.

## Reglas que NO se negocian

1. **Sin NgModules** — solo standalone.
2. **TypeScript-only** — sin `.js` de aplicación; componentes con `template`/`styles` **inline** (nunca `*.component.html`).
3. **Signals** para estado local/UI; **RxJS** para HTTP/streams.
4. **JSDoc** obligatorio en servicios, componentes, interfaces públicas, guards, interceptores y funciones complejas.
5. **Tailwind**: no nombrar features `home` (Tailwind ignora esa carpeta). Usar `landing`, `auth`, `dashboard`, etc.
6. Decisiones transversales → ADR en `docs/adr/` + comentario inline.

## Lecturas obligatorias antes de codear

1. `agents.md`
2. `.cloude/system-prompt.md`
3. Skill Angular: `.cloude/angular-developer/SKILL.md` (equipo / Claude Code)

## Flujo BMAD sugerido (brownfield)

| Tamaño | Track | Inicio |
| ------ | ----- | ------ |
| Bug / cambio chico | Quick Flow | `bmad-quick-dev` o `bmad-help` |
| Feature mediana/grande | BMad Method | `bmad-create-prd` → architecture → stories → `bmad-dev-story` |

Primera acción recomendada en un chat nuevo: invocar **`bmad-help`**.
