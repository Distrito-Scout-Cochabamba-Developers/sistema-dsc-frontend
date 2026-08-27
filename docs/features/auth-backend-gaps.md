# Gaps del backend que limitan autenticación

El frontend **no modifica** el backend. Lo que falta queda aquí.

| Gap | Impacto | Mitigación en frontend | Falta en API |
| --- | --- | --- | --- |
| Cookie HttpOnly `access_token`, sin token en JSON | No se puede usar Bearer desde JS | `withCredentials` + proxy en `ng serve` | Documentar cookie como contrato oficial |
| No hay `POST /api/auth/logout` | No se puede borrar la cookie | «Cerrar sesión» solo limpia el perfil en memoria; un refresh rehidrata `/me` | Logout que expire `access_token` |
| Cookie 60 minutos fijos | «Recuérdame» no alarga la sesión | Checkbox visual, no se envía | `rememberMe` o `Expires` configurable |
| `SameSite=Strict` + sin CORS | Prod en otro origen no enviará la cookie | Proxy local; prod same-origin o CORS + `AllowCredentials` | CORS o reverse proxy |
| No hay Google / OAuth | El botón del mockup no puede autenticar | Botón deshabilitado | IdP + callback |
| No hay registro público | «Regístrate» no tiene destino | Botón deshabilitado | `POST /api/auth/register` (si producto lo pide) |
| No hay recuperación de contraseña | «Olvidé mi contraseña» inerte | Botón deshabilitado | Flujo de reset |
| `/me` no trae CI, nombre completo ni teléfono | Asistencia no puede prellenar el formulario | Banner de sesión; el dirigente escribe el CI | Ampliar `UserProfileDto` o lookup por `userId` |
| Contraseña en claro en infra (hasher de desarrollo) | Riesgo de seguridad, no de UI | N/A | Hash real (fuera de este repo frontend) |
| Centro de ayuda / legales | Links del mockup sin destino | Deshabilitados | CMS o URLs estáticas |

## Preguntas abiertas (consultar antes de implementar)

1. ¿Logout en API o basta con expiración de cookie?
2. ¿«Recuérdame» debe cambiar la duración de la cookie?
3. ¿Google es requisito de producto o solo del mockup?
4. ¿El registro de cuentas es público o solo administración?
5. ¿`/me` debe incluir datos de dirigente (CI) para prefill de asistencia?
