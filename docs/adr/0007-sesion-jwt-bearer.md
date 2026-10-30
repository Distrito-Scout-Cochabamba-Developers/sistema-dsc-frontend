# 0007. Sesión JWT Bearer (login v1)

- Estado: Accepted
- Fecha: 2026-10-21
- Decisores: Equipo frontend DSC
- Relacionado: [0005](./0005-sesion-cookie-http-only.md) (deprecated)

## Contexto

El backend retiró cookie HttpOnly y las rutas `/api/auth/login*`. El contrato vigente es `POST /api/v1/auth/login` con JWT en el body y roles reales en el claim `roles`.

## Decisión

1. Guardar `token` + `expiresAt` en `sessionStorage` o `localStorage` (Recuérdame).
2. `authInterceptor` envía `Authorization: Bearer <token>` en `/api`.
3. Hidratar con `GET /api/v1/auth/me` solo si hay token vigente.
4. `AuthSessionService` expone Signals: `currentUser`, `isAuthenticated`, `roles`.
5. Guards funcionales `authGuard` y `roleGuard` listos; no se aplican a asistencia (API anónima).
6. No modificar el backend.

## Consecuencias

- El frontend deja de usar `withCredentials` para auth.
- «Cerrar sesión» no invalida el JWT en el servidor.
- XSS puede leer el token (trade-off del contrato).
- Gaps: [auth-backend-gaps.md](../features/auth-backend-gaps.md).
