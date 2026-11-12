# Performance: Deferred Loading, Zoneless, and Images

## `@defer` Blocks

`@defer` lazy-loads a template section and its dependencies (components, directives, pipes) into separate chunks. Dependencies must be standalone and not referenced outside the block.

```html
@defer (on viewport) {
  <app-comments-panel [postId]="postId()" />
} @placeholder {
  <div class="skeleton"></div>
} @loading (minimum 300ms) {
  <app-spinner />
} @error {
  <p>Could not load comments.</p>
}
```

Common triggers: `on viewport`, `on idle` (default), `on interaction`, `on hover`, `on timer(2s)`, and `when <condition>`. Add `prefetch on idle` to download early but render late.

Use `@defer` for below-the-fold content, heavy widgets (charts, editors, maps), and rarely used dialogs. Do not defer content needed for the initial meaningful paint or LCP element.

## Zoneless Change Detection

Modern Angular can run without zone.js; change detection is driven by signals, `AsyncPipe`, and explicit notifications.

```ts
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection()],
};
```

Requirements for zoneless-compatible code (good practice even with zone.js):

- Use signals (or `AsyncPipe`) for any state read by templates.
- Use `ChangeDetectionStrategy.OnPush` in components.
- Never mutate state and rely on zone.js to notice — update through signals.
- Remove `zone.js` from `polyfills` in `angular.json` when fully migrated.

Check the project's Angular version for the API's stability status before enabling it.

## Other High-Impact Practices

- **`OnPush` everywhere**: pair with signals and immutable inputs.
- **`NgOptimizedImage`**: use `ngSrc` for automatic lazy loading, `srcset`, and priority hints on the LCP image (`priority` attribute).
- **Lazy routes**: `loadComponent` / `loadChildren` for every feature (see [loading-strategies.md](loading-strategies.md)).
- **`track` in `@for`**: always provide a stable key to avoid DOM churn.
- **Bundle budgets**: keep `angular.json` budgets enabled and treat warnings as regressions.
