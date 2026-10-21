# Registro a módulos según rol (pendiente de backend)

- **Estado:** Login ya trae roles; asistencia **sigue anónima** — no implementable de forma segura solo en frontend
- **Fecha:** 2026-10-21
- **Relacionado:** [asistencia-registro.md](./asistencia-registro.md) · [asistencia-backend-gaps.md](./asistencia-backend-gaps.md) · [auth-login.md](./auth-login.md)

## Regla de producto (acordada)

| Actor | Qué puede hacer |
| ----- | ---------------- |
| **Admin** o **Secretaría** | Registrar a **otras personas** en un módulo (formulario libre: CI, nombre, extensión, teléfono; lookup por CI). |
| **Usuario normal** (dirigente / su propia cuenta) | Registrarse **solo a sí mismo**. El formulario se autocompleta con los datos de **su persona** y no permite cambiar de CI. |

Hoy la pantalla de asistencia es la misma para todos y el POST es anónimo.

## Por qué no se hace solo en el frontend

1. `POST /api/attendance/register` y `GET /api/attendance/lookup-ci/{ci}` **no piden autenticación ni rol**. Cualquier cliente puede inscribir cualquier CI. Una UI que “bloquee” el formulario no es una regla de negocio.
2. `GET /api/v1/auth/me` trae `id`, `personId`, `username`, `email`, `roles`. **No hay CI, nombre, extensión ni teléfono**, así que no se puede autocompletar “con mi credencial”.
3. El login **sí** emite roles (`ADMIN`, `DISTRICT_SECRETARY`, `BRANCH_COMMISSIONER`, …), pero:
   - ningún endpoint de asistencia usa `[Authorize]` ni `[Authorize(Roles = …)]`;
   - un `RoleGuard` en Angular no impide `POST /api/attendance/register` anónimo.

Simular la UX en Angular (ocultar campos si el JWT no trae admin) **no impide** registrar a terceros vía API.

## Qué tiene que exponer el backend (futura actualización)

Orden sugerido:

1. **Autorizar asistencia:** `[Authorize]` en lookup y register.
2. **Regla en el handler de register:**
   - si el usuario es `ADMIN` o `DISTRICT_SECRETARY` → se acepta el body (CI de terceros), como ahora;
   - si no → **ignorar CI/nombre del body** y registrar con la `Person` ligada a `CurrentUser` (relación `user.person_id`).
3. **Datos de persona en sesión:** ampliar `/me` **o** `GET /api/v1/auth/me/person` con CI, extensión, nombres y teléfono.
4. Lookup por CI: reservarlo a admin/secretaría.

Cuando eso exista, el frontend podrá:

- leer `session().roles`;
- admin/secretaría: formulario actual (lookup + alta de terceros);
- resto: campos de identidad en solo lectura, prellenados desde `/me`, y un POST que ya no depende de que el cliente sea honesto.

## Fuera de alcance de este documento

- Semilla de módulos / QR de convocatoria.
- Logout, Google, registro de cuentas.
- Códigos de rol: ya definidos en backend (`ADMIN`, `DISTRICT_SECRETARY`, …).
