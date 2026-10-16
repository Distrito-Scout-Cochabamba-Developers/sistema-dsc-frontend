# Registro a módulos según rol (pendiente de backend)

- **Estado:** Documentado; **no implementable de forma segura solo en frontend**
- **Fecha:** 2026-10-16
- **Relacionado:** [asistencia-registro.md](./asistencia-registro.md) · [asistencia-backend-gaps.md](./asistencia-backend-gaps.md) · [auth-login.md](./auth-login.md)

## Regla de producto (acordada)

| Actor | Qué puede hacer |
| ----- | ---------------- |
| **Admin** o **Secretaría** | Registrar a **otras personas** en un módulo (formulario libre: CI, nombre, extensión, teléfono; lookup por CI). |
| **Usuario normal** (dirigente / su propia cuenta) | Registrarse **solo a sí mismo**. El formulario se autocompleta con los datos de **su persona** y no permite cambiar de CI. |

Hoy la pantalla de asistencia es la misma para todos y el POST es anónimo.

## Por qué no se hace solo en el frontend

1. `POST /api/attendance/register` y `GET /api/attendance/lookup-ci/{ci}` **no piden autenticación ni rol**. Cualquier cliente puede inscribir cualquier CI. Una UI que “bloquee” el formulario no es una regla de negocio.
2. `GET /api/auth/me` (`UserProfileDto`) solo trae `id`, `username`, `email`, `roles`. **No hay CI, nombre, extensión ni teléfono**, así que no se puede autocompletar “con mi credencial”.
3. El modelo RBAC existe (`role`, `user_role`, claims en el JWT), pero:
   - la tabla `role` no está sembrada (no hay códigos `ADMIN` / `SECRETARIA`);
   - ningún endpoint de asistencia usa `[Authorize]` ni `[Authorize(Roles = …)]`;
   - el usuario local de desarrollo queda con `roles: []`.

Simular la UX en Angular (ocultar campos si el JWT no trae admin) **no impide** registrar a terceros vía API.

## Qué tiene que exponer el backend (futura actualización)

Orden sugerido:

1. **Catálogo de roles** y asignación. Códigos tentativos (confirmar con producto): `ADMIN`, `SECRETARIA`, y el rol de dirigente/usuario normal (p. ej. `DIRIGENTE` o el que definan).
2. **Autorizar asistencia:** `[Authorize]` en lookup y register.
3. **Regla en el handler de register:**
   - si el usuario es `ADMIN` o `SECRETARIA` → se acepta el body (CI de terceros), como ahora;
   - si no → **ignorar CI/nombre del body** y registrar con la `Person` ligada a `CurrentUser` (relación `user.person_id`).
4. **Datos de persona en sesión:** ampliar `UserProfileDto` / `/me` **o** `GET /api/auth/me/person` con CI, extensión, nombres y teléfono, para el prefill del formulario del usuario normal.
5. Lookup por CI: reservarlo a admin/secretaría (el usuario normal no lo necesita).

Cuando eso exista, el frontend podrá:

- leer `session().roles`;
- admin/secretaría: formulario actual (lookup + alta de terceros);
- resto: campos de identidad en solo lectura, prellenados desde `/me`, y un POST que ya no depende de que el cliente sea honesto.

## Fuera de alcance de este documento

- Semilla de módulos / QR de convocatoria.
- Logout, Google, registro de cuentas.
- Códigos definitivos de rol (producto + backend).
