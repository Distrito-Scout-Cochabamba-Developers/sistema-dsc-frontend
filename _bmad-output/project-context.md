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
2. **TypeScript-only** — sin `.js` de aplicación. Template inline si tiene ≤50 líneas; si supera 50, usar `.html` propio con `templateUrl`, según `agents.md` y ADR 0003. Estilos con Tailwind y `src/styles.css`; CSS de componente solo por necesidad real.
3. **Signals** para estado local/UI; **RxJS** para HTTP/streams.
4. **JSDoc** obligatorio en servicios, componentes, interfaces públicas, guards, interceptores y funciones complejas.
5. **Tailwind**: no nombrar features `home` (Tailwind ignora esa carpeta). Usar `landing`, `auth`, `dashboard`, etc.
6. Decisiones transversales → ADR en `docs/adr/` + comentario inline.

## Lecturas obligatorias antes de codear

1. `agents.md`
2. `.cloude/system-prompt.md`
3. Skill Angular: `.cloude/angular-developer/SKILL.md` (equipo / Claude Code)
4. Seguimiento: `docs/seguimiento.md`
5. Feature en curso (si aplica): `docs/features/`

## Flujo BMAD sugerido (brownfield)

| Tamaño | Track | Inicio |
| ------ | ----- | ------ |
| Bug / cambio chico | Quick Flow | `bmad-quick-dev` o `bmad-help` |
| Feature mediana/grande | BMad Method | `bmad-create-prd` → architecture → stories → `bmad-dev-story` |

Primera acción recomendada en un chat nuevo: invocar **`bmad-help`**.

## Coordinación de producto y artefactos compartidos

- La carpeta padre `DSC System` es un workspace local del usuario que no se subirá a Git. Este repositorio debe conservar el contexto y los artefactos necesarios para el equipo sin depender de esa carpeta.
- Aunque la sesión comience en el workspace padre, resolver BMAD con este repositorio como `project-root` al crear o actualizar sus artefactos.
- Guardar UX visual en `_bmad-output/planning-artifacts/DESIGN.md` y comportamiento, flujos y estados en `EXPERIENCE.md` del mismo directorio cuando se desarrolle UX.
- Guardar la contribución del frontend al release, sus specs, criterios de aceptación y dependencias en los artefactos BMAD de este repositorio. Mantener las decisiones técnicas locales en la documentación existente y en `docs/adr/`.
- Para requisitos compartidos, registrar los IDs reales de Azure Boards y mantener una contribución autosuficiente en los artefactos BMAD de este repositorio. El PRD del backend es antecedente en borrador; conciliarlo al comenzar el nuevo spec y PRD.
- Cuando cambie un requisito compartido, actualizar los artefactos afectados del frontend y revisar el impacto en backend y Azure Boards. Evitar copias independientes del mismo requisito.
- El alcance inicial indicado por el usuario para el release de diciembre comprende inscripción/consulta de módulos de formación y cuadernillos escritos dentro del sistema con asignación/seguimiento de revisores, utilizando un catálogo compartido de módulos. Las plantillas cambian según nivel: se incluyen IM II y III (uno y dos ciclos de programa, respectivamente); Paxtú Grupo/Distrito y otros niveles se reservan para futuros releases. El procedimiento recibido describe entregas PDF y revisión por una comisión; validar vigencia y adaptación al sistema antes de fijar UX/requisitos. La contribución frontend está en `_bmad-output/planning-artifacts/release-1-frontend-contribution.md`. Año/tipo del hito de diciembre, aceptación detallada y flujos específicos siguen en definición. No inferir compromisos adicionales del backlog ni iniciar PRD/spec hasta que el usuario lo indique.
