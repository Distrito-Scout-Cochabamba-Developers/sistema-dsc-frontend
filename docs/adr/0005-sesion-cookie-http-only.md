# 0005. Sesión por cookie HttpOnly (login)

- Estado: Accepted
- Fecha: 2026-08-26
- Decisores: Equipo frontend DSC
- Relacionado: [0004](./0004-integracion-http-asistencia.md)

## Contexto

El backend ya expone `POST /api/auth/login/email` (y `/login`, `/login/username`) y `GET /api/auth/me`. El JWT se escribe en cookie HttpOnly `access_token`; el JSON de login es solo `UserProfileDto`. El interceptor Bearer del frontend no tenía token que enviar. El mockup de login es a pantalla completa, incompatible con el shell permanente en `App`.

## Decisión

1. Login real en feature `auth`, ruta `/auth/login`, **fuera** de `MainLayout`.
2. Cliente HTTP con `withCredentials` en llamadas `/api`. No se guarda JWT en `localStorage` ni en memoria.
3. Hidratar sesión al arrancar con `GET /api/auth/me`.
4. No inventar Google, registro, logout ni recuperación: UI del mockup deshabilitada y gaps documentados.
5. No modificar el backend.

## Consecuencias

- En desarrollo el proxy debe reescribir la cookie a `localhost`.
- «Cerrar sesión» es incompleto hasta que exista logout en API.
- El perfil autenticado no prellena asistencia (no hay CI en `/me`).
- Gaps: [auth-backend-gaps.md](../features/auth-backend-gaps.md).
