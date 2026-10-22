# Login y sesión (frontend)

- **Estado:** Completado (identifier + JWT Bearer + Signals + guards listos)
- **Ruta:** `/auth/login` (alias `/login`)
- **Contrato backend:** `sistema-dsc-backend/docs/auth-login.md`
- **Emblema:** `public/assets/branding/distrito-cochabamba-emblem.png`
- **Marca DSC:** `public/assets/branding/dsc-grid-mark.svg`
- **Última actualización:** 2026-10-21

## Contrato HTTP

| Método | Path | Body / notas |
| ------ | ---- | ------------ |
| `POST` | `/api/v1/auth/login` | `{ identifier, password }` → `{ token, tokenType: "Bearer", expiresAt, user }` |
| `GET` | `/api/v1/auth/me` | Header `Authorization: Bearer <token>` → `{ id, personId, username, email, roles }` |

`identifier` es **username o email**. El JWT va en el **body**, no en cookie. El interceptor adjunta Bearer en `/api`.

Rutas retiradas en backend (404): `/api/auth/login`, `/api/auth/login/email`, `/api/auth/login/username`.

### Claims del JWT

`sub`, `email`, `personId`, `username`, `roles`, `exp`, `iss`, `aud`. `RoleClaimType` = `roles`.

### Roles (`role.code`)

`ADMIN`, `DISTRICT_DIRECTOR`, `COMMUNICATIONS_OFFICER`, `DISTRICT_SECRETARY`, `FINANCE_COMMISSIONER`, `YOUTH_PROGRAM_COORDINATOR`, `ADULT_RESOURCES_COORDINATOR`, `QUARTERMASTER`, `OPERATIONS_OFFICER`, `BRANCH_COMMISSIONER`.

Constantes TS: `src/app/core/models/auth-roles.ts`.

## Implementación Angular 22

| Spec | Dónde |
| ---- | ----- |
| Login Tailwind v4 + Signal Forms | `features/auth/login-page.ts` + `.html` (`form()` / `submit()`) |
| `AuthSessionService` Signals | `currentUser`, `isAuthenticated`, `roles`, `accessToken` |
| Interceptor Bearer | `core/interceptors/auth.interceptor.ts` |
| Guards funcionales | `authGuard`, `roleGuard(...códigos)` en `core/guards/` |

El JWT se guarda en `sessionStorage` o, si «Recuérdame», en `localStorage` (`dsc.auth.session`). Al arrancar, si hay token vigente se llama a `/me`.

`authGuard` / `roleGuard` se aplican en `/admin/modulos` (`ADMIN`, `DISTRICT_SECRETARY`). No se aplican a `/`, `/modulos` ni `/asistencia`: el registro de asistencia sigue siendo anónimo en la API.

## Usuarios de desarrollo

Contraseña local (Docker / Compose): **`1234`** (`DSC_SEED_PASSWORD`). El seeder corre en el servicio `auth-seed`; no hace falta `dotnet` en el host.

| Username | Roles |
| -------- | ----- |
| `pablo.rocha` | `ADMIN`, `DISTRICT_DIRECTOR` |
| `maricel.rocha` | `DISTRICT_SECRETARY`, `FINANCE_COMMISSIONER` |
| `teresa.aillon` | `COMMUNICATIONS_OFFICER` |
| `german.rocha` | `YOUTH_PROGRAM_COORDINATOR` |
| `daniel.vargas` | `ADULT_RESOURCES_COORDINATOR` |
| `jorge.revollo` | `QUARTERMASTER` |
| `apu` | `OPERATIONS_OFFICER` |
| `ana.laura` / `fabiola` / `erick` / `mariel` | `BRANCH_COMMISSIONER` |

## Comportamiento de producto

- Login a pantalla completa (fuera de `MainLayout`).
- Tras login: `returnUrl` interno o `/`.
- Navbar: iniciar sesión / cerrar sesión (solo borra el JWT local; no hay logout API).
- Google, registro, «olvidé contraseña»: visibles y deshabilitados.

## Pendiente de API (no bloquea este login)

Logout que invalide el token, Google, registro de cuenta, CI en `/me`, `[Authorize]` en asistencia. Ver [auth-backend-gaps.md](./auth-backend-gaps.md).
