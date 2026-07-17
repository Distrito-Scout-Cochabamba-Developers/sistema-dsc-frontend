# agents.md — Contrato de Desarrollo

Documento normativo para humanos y agentes de IA (BMAD u otros). **Léelo completo antes de crear o modificar código en este repositorio.**

---

## 1. Propósito

Este contrato alinea a todos los contribuidores con una arquitectura Angular enterprise, predecible y documentada, apta para trabajo paralelo por múltiples agentes sin degradar la cohesión del código.

---

## 2. Stack y fundamentos

| Aspecto | Norma |
| --------- | -------- |
| Framework | Angular **22+**, **Standalone Components** por defecto |
| Lenguaje | **TypeScript-only** (`allowJs: false`); sin `.js` de aplicación |
| Estilos | **Tailwind CSS v4** (utilidades en templates) + `src/styles.css` / `src/styles.scss`; componentes sin `*.html` |
| TypeScript | Modo **estricto** + `strictTemplates` obligatorio |
| Enrutamiento | `Router` con **lazy loading** de features |
| UI en core | **Prohibida** |

### Prohibiciones absolutas

- **NgModules** (`NgModule`, `*Module.ts` de aplicación): no crear, no restaurar, no sugerir.
- Añadir archivos **JavaScript** de producto o tooling (usar `.ts`).
- Crear `templateUrl` / `styleUrl` hacia `.html`/`.scss` de componente (salvo ADR).
- Desactivar el modo estricto de TypeScript sin ADR aprobado.
- Colocar componentes, templates o estilos de UI dentro de `core/`.
- Acoplar `shared/` a lógica de negocio o a imports de `features/`.
- Generar código **sin** documentación JSDoc en entidades nuevas (ver §5).

---

## 3. Arquitectura (Core / Shared / Features / Layout)

```text
src/app/
├── core/       → Singletons: guards, interceptors, servicios globales, InjectionTokens
├── shared/     → Dumb components, directives, pipes, utils (agnósticos al dominio)
├── features/   → Páginas/dominios enrutados (lazy-loaded)
├── layout/     → Shell: navbar, sidebar, footer, regiones de outlet
└── docs/       → Índices y documentación técnica de apoyo
docs/adr/       → Architecture Decision Records
```

### Reglas de dependencia

```text
features  →  shared, core, layout (consumo limitado)
layout    →  shared, core
shared    →  (Angular / libs públicas únicamente; NUNCA features ni core de negocio)
core      →  (Angular / libs; sin UI; sin imports de features)
```

- **`core`**: una sola instancia por app (providers en `app.config.ts`). Sin selectores de UI.
- **`shared`**: presentación pura; inputs/outputs o model signals; sin llamadas HTTP de dominio.
- **`features`**: cada feature es un bounded context con sus rutas, containers y servicios de dominio.
- **`layout`**: composición estructural; no reglas de negocio.

### Lazy loading (obligatorio para features)

```typescript
{
  path: 'ejemplo',
  loadChildren: () =>
    import('./features/ejemplo/ejemplo.routes').then((m) => m.EJEMPLO_ROUTES),
}
```

Preferir `loadComponent` / `loadChildren` frente a imports estáticos de features en el bundle inicial.

---

## 4. Estado y asincronía

| Caso | Tecnología |
| ------ | ------------ |
| Estado local de componente / UI | **Angular Signals** (`signal`, `computed`, `effect` con justificación) |
| Flujos asíncronos (HTTP, streams, eventos) | **RxJS** |
| Bridge RxJS → Signal | `toSignal` / `toObservable` cuando corresponda |

### Normas

1. No usar `BehaviorSubject` como estado local de UI si un `signal` basta.
2. No suscribirse manualmente en componentes sin estrategia de teardown (`takeUntilDestroyed`, `async` pipe, o `toSignal`).
3. Stores globales de terceros (NgRx, etc.): **solo** tras ADR en `docs/adr/`.
4. Servicios de estado global viven en `core/services/` y exponen API clara (signals y/o observables documentados).

---

## 5. Documentación (obligatoria)

### 5.1 JSDoc — regla estricta

Todo agente **debe** documentar con bloques JSDoc cada entidad nueva que cree:

- Servicios (`@Injectable`)
- Componentes (`@Component`)
- Directivas y pipes
- Interfaces y types públicos
- Guards e interceptores
- Funciones complejas (más de una responsabilidad trivial, lógica de dominio, o efectos colaterales)

Plantilla mínima:

```typescript
/**
 * [Propósito en una frase.]
 *
 * [Contexto opcional: cuándo usarlo / restricciones de capa.]
 *
 * @param nombre - Descripción del parámetro.
 * @returns Descripción del valor de retorno.
 * @throws {ErrorType} Cuándo se lanza (si aplica).
 */
```

Ejemplo de componente:

```typescript
/**
 * Botón de acción primaria reutilizable (presentational).
 * Vive en `shared`; no contiene lógica de negocio ni llamadas HTTP.
 *
 * @remarks
 * Usar solo para CTAs tipados por Inputs; el padre decide el side-effect.
 */
@Component({ /* ... */ })
export class PrimaryButtonComponent {}
```

Ejemplo de servicio:

```typescript
/**
 * Gestiona la sesión de usuario a nivel de aplicación (singleton en `core`).
 *
 * @remarks
 * Expone estado vía Signals; las llamadas HTTP usan RxJS internamente.
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  /**
   * Intenta autenticar con credenciales.
   *
   * @param credentials - Usuario y contraseña ya validados en UI.
   * @returns Observable que completa con el perfil autenticado.
   */
  login(credentials: LoginCredentials): Observable<UserProfile> { /* ... */ }
}
```

### 5.2 Decisiones arquitectónicas complejas

Si una decisión no es obvia (nueva dependencia, excepción a las capas, patrón de estado, cambio de routing, etc.):

1. Comentario **inline** breve justificando el *por qué* junto al código.
2. Si el impacto es transversal o permanente → crear/actualizar un **ADR** en `docs/adr/`.

Formato ADR sugerido: `docs/adr/NNNN-titulo-corto.md` (estado: Proposed | Accepted | Deprecated).

### 5.3 Archivos de contexto IA

Antes de escribir código, el agente debe haber leído:

1. Este archivo (`agents.md`)
2. `.cloude/system-prompt.md`
3. El `README.md` (arquitectura y convenciones)
4. `_bmad-output/project-context.md` (si el flujo es BMAD)

Para guía técnica de Angular por tema (signals, forms, DI, HTTP, routing, performance, testing, etc.), consultar la skill compartida `.cloude/angular-developer/SKILL.md` y sus `references/` (versión para Claude Code / equipo). Quienes usen Cursor pueden mantener una copia local en `.cursor/skills/angular-developer/` (ignorada por Git). Ante conflicto, este contrato prevalece sobre la skill y sobre BMAD.

### BMAD Method

El proyecto usa BMAD (módulo BMM) para planificación e implementación por historias.

- Equipo (Claude Code): skills en `.claude/skills/`
- Cursor (compartido): skills en `.agents/skills/`
- Artefactos: `_bmad-output/`
- Reinstalar / actualizar solo con **pnpm**: `pnpm dlx bmad-method@latest install`

Primera acción recomendada: invocar `bmad-help`.

---

## 6. Convenciones de implementación

1. Prefijos y sufijos estándar Angular (`*.component.ts`, `*.service.ts`, `*.guard.ts`, `*.interceptor.ts`, `*.routes.ts`).
2. Selectores de componente con prefijo de aplicación consistente (p. ej. `app-`).
3. No dejar `any` sin justificación documentada.
4. Tests colocados junto al artefacto o en convención del scaffold; no omitir cobertura en lógica de `core` y dominio de features.
5. Commits atómicos; no mezclar refactors de arquitectura con features sin ADR.

---

## 7. Checklist previo a un PR / entrega de agente

- [ ] Sin NgModules nuevos ni archivos `.js` de aplicación
- [ ] Componentes con `template`/`styles` inline (TypeScript-only)
- [ ] Archivo en la capa correcta (`core` / `shared` / `features` / `layout`)
- [ ] Feature nueva con lazy loading
- [ ] Estado local con Signals; asincronía con RxJS
- [ ] JSDoc en toda entidad nueva pública o compleja
- [ ] Decisiones no triviales documentadas (inline y/o ADR)
- [ ] SCSS global solo en `styles.scss`; sin romper strict TypeScript
- [ ] No se alteró la arquitectura de carpetas sin ADR

---

## 8. Violaciones

Cualquier generación que incumpla este contrato (especialmente ausencia de JSDoc, uso de NgModules, o contaminación de capas) debe **rechazarse y rehacerse** antes de integrarse.

*Última actualización del contrato: 2026-07-17.*
