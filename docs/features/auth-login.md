# Login y sesión (frontend)

- **Ruta:** `/auth/login` (alias `/login`)
- **Emblema:** `public/assets/branding/distrito-cochabamba-emblem.png` → URL `/assets/branding/distrito-cochabamba-emblem.png`
- **Marca DSC (cuadrícula):** `public/assets/branding/dsc-grid-mark.svg` → `/assets/branding/dsc-grid-mark.svg`

## Cómo cargar el logo

Angular copia todo lo que esté en `public/` a la raíz del sitio (`angular.json` → `assets`).

1. Coloca el PNG oficial del emblema (fondo transparente o degradado claro) en:

   `sistema-dsc-frontend/public/assets/branding/distrito-cochabamba-emblem.png`

2. No cambies el nombre del archivo si no actualizas `DISTRITO_EMBLEM_SRC` en `src/app/features/auth/login-page.ts`.
3. Recarga `ng serve`. La imagen se pide como `/assets/branding/distrito-cochabamba-emblem.png`.

Hoy hay un recorte del mockup como placeholder. Sustitúyelo por el archivo de marca en alta resolución cuando lo tengas.

## Contrato HTTP usado

| Método | Path | Body / notas |
| ------ | ---- | ------------ |
| `POST` | `/api/auth/login/email` | `{ email, password }` → `UserProfileDto`. Cookie HttpOnly `access_token`. |
| `POST` | `/api/auth/login` | Mismo handler que email (no lo usa la UI). |
| `POST` | `/api/auth/login/username` | `{ username, password }` (cliente listo, UI no lo usa). |
| `GET` | `/api/auth/me` | Requiere cookie. Hidrata la sesión al arrancar. |

La API **no** devuelve el JWT en JSON. El frontend envía `withCredentials: true` y el proxy reescribe el dominio de la cookie a `localhost`.

## Comportamiento de producto

- Login a **pantalla completa** (fuera de `MainLayout`).
- Paleta DSC: `--color-dsc` `#009ee2`, `dsc-soft`, `dsc-dark`, `dsc-navy`.
- Tras login: `returnUrl` interno o `/`.
- Navbar «Iniciar Sesión» navega a `/auth/login`. «Cerrar sesión» solo limpia el estado local (no hay logout en API).
- Google, registro, «olvidé contraseña», centro de ayuda: visibles y **deshabilitados**.
- «Recuérdame» es solo UI: la cookie dura 60 minutos fijos en backend.

Detalle de gaps: [auth-backend-gaps.md](./auth-backend-gaps.md).
