# Gaps del backend que limitan la integración de asistencia

El frontend no cambia el backend salvo cuando falta capacidad (catálogo GET, 2026-10-16). Contrato backend: `sistema-dsc-backend/docs/`. Mitigaciones locales mientras tanto.

| Gap | Impacto | Mitigación | Falta en API |
| --- | --- | --- | --- |
| GET de convocatoria (fecha/horario/QR admin) | El catálogo usa el módulo curricular, no una sesión agendada | `GET /api/attendance/modules/{code}` | Endpoint de `TrainingModuleSession` |
| No hay CORS | Browser no puede llamar `:5090` desde `:4200` | `proxy.conf.json` solo en `ng serve` | `UseCors` con origen del frontend |
| Login JWT ya existe | A-11 hecho: Bearer + Signals + guards | Ver [auth-login.md](./auth-login.md) | Logout, refresh, CORS prod |
| `/me` sin CI | Usuario normal no puede autocompletar su persona | Banner de usuario | Ampliar perfil o `GET /me/person` |
| Register/lookup **anónimos** | No hay regla admin vs. “solo yo” | No se puede mitigar en UI de forma segura | `[Authorize]` + roles en el handler (ver [asistencia-registro-por-rol.md](./asistencia-registro-por-rol.md)) |
| Asistencia sin `[Authorize]` | Roles en login no rigen el POST | Guards listos; no se aplican a `/asistencia` | Autorizar attendance por rol |
| No hay QR admin | A-12 generación bloqueada | Consumo del deep link + QR local | Endpoint de Secretaría |
| Token = `TrainingModule.Code`, no `QrToken` | El QR no apunta a una convocatoria | Deep link usa el `code` | Decidir Code vs Guid |
| Código demo puede no existir en BD | POST 404 | Semilla Docker `docker/seed-dev-modules.sql` | Datos en cada entorno |
| Catálogos de contacto vacíos | POST 500 al guardar teléfono (`contact_mechanism_type` id=2, `contact_purpose_type` id=1) | Semilla Docker `docker/seed-dev-user.sql` | El handler usa IDs fijos; debería resolver por `code` |
| CI API 4–10 vs UI 7–10 | CIs cortos rechazados en UI | UI más estricta | Alinear si hay CIs cortos |

## Preguntas abiertas

1. ¿Deep link con `Code` o `QrToken`?
2. ¿Registro público (sin auth), como está la API hoy? **Producto: no.** Admin/secretaría inscriben a terceros; el usuario normal solo a sí mismo. Requiere cambio de API.
3. ¿Producción same-origin o CORS?
4. ¿Existe en PostgreSQL `training_module.code = mod-liderazgo-20241024`? **Sí en Docker local** (`docker/seed-dev-modules.sql`).
