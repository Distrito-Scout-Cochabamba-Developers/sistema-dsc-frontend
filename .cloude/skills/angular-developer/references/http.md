# HTTP: HttpClient, Interceptors, and httpResource

## Providing HttpClient

Register `HttpClient` once in `app.config.ts` with `provideHttpClient`. Prefer the `fetch` backend for new applications (required for SSR streaming, better performance).

```ts
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
```

## Functional Interceptors

Use functional interceptors (`HttpInterceptorFn`), not class-based ones. They compose with `withInterceptors` in registration order and can use `inject()`.

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

/**
 * Attaches the bearer token to outgoing API requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthSessionService).token();
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

Common interceptor use cases: auth headers, error mapping/retry, logging, caching, loading indicators. Requests are immutable — always use `req.clone()`.

## Reactive Data Fetching with `httpResource`

`httpResource` wraps `HttpClient` and exposes the request state as signals (`value`, `status`, `error`, `isLoading`). The request re-fires automatically when signals used in the URL/options change. Check the project's Angular version for its stability status before use.

```ts
import { httpResource } from '@angular/common/http';

@Component({...})
export class UserDetail {
  readonly userId = input.required<string>();

  // Refetches whenever userId() changes.
  protected readonly user = httpResource<User>(() => `/api/users/${this.userId()}`);
}
```

```html
@if (user.isLoading()) { <app-spinner /> }
@else if (user.hasValue()) { <app-user-card [user]="user.value()" /> }
@else { <p>Error loading user</p> }
```

### Choosing an approach

- Use `httpResource` / `resource`: for **reading** data that should react to signal changes.
- Use `HttpClient` observables directly: for **mutations** (POST/PUT/DELETE) and one-off imperative calls; convert with `toSignal` if the template needs signal access.
- Never `subscribe()` in components without teardown — prefer `takeUntilDestroyed`, the `async` pipe, or `toSignal`.

## Testing

Use `provideHttpClientTesting` with `HttpTestingController` to flush mocked responses and verify no outstanding requests.
