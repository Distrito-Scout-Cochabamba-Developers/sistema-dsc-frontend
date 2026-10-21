# Gaps del backend que limitan autenticación

Login JWT + roles **ya está**. Lo que falta:

| Gap | Impacto | Mitigación en frontend | Falta en API |
| --- | --- | --- | --- |
| No hay `POST /api/v1/auth/logout` | El JWT sigue válido hasta `exp` | «Cerrar sesión» borra storage y memoria | Revocar o acortar token |
| JWT en Web Storage | XSS puede leer el token | Mínimo de JS propio; no hay cookie HttpOnly | — (contrato actual) |
| `/me` sin CI / teléfono | No se prellena asistencia | Banner de sesión | Ampliar perfil o `GET /me/person` |
| Asistencia anónima | Un `RoleGuard` no impide inscribir por API | Guards listos; no se aplican a `/asistencia` | `[Authorize]` + regla por rol |
| No hay Google / OAuth | Botón del mockup inerte | Deshabilitado | IdP + callback |
| No hay registro público | «Regístrate» sin destino | Deshabilitado | `POST /api/auth/register` si producto lo pide |
| No hay recuperación de contraseña | Enlace inerte | Deshabilitado | Flujo de reset |

## Preguntas abiertas

1. ¿Logout que invalide el JWT?
2. ¿Google es requisito de producto?
3. ¿`/me` debe incluir ficha de dirigente (CI) para asistencia?
4. ¿Asistencia debe exigir `ADMIN` / `DISTRICT_SECRETARY` para terceros? Ver [asistencia-registro-por-rol.md](./asistencia-registro-por-rol.md).
