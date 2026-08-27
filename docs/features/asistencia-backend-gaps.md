# Gaps del backend que limitan la integración de asistencia

El frontend **no modifica** el backend. Mitigaciones locales mientras tanto.

| Gap | Impacto | Mitigación | Falta en API |
| --- | --- | --- | --- |
| No hay GET de sesión | No hay nombre/fecha reales ni 404 previo al POST | Vista local desde el token; el POST valida el código | `GET /api/attendance/session/{token}` |
| No hay CORS | Browser no puede llamar `:5090` desde `:4200` | `proxy.conf.json` solo en `ng serve` | `UseCors` con origen del frontend |
| No hay login / JWT | A-11 bloqueado | Toggle demo; interceptor Bearer inerte | Login + token o cookie |
| No hay refresh / cookies | B-05 incompleto | N/A | Política de sesión |
| No hay QR admin | A-12 generación bloqueada | Consumo del deep link + QR local | Endpoint de Secretaría |
| Token = `TrainingModule.Code`, no `QrToken` | El QR no apunta a una convocatoria | Deep link usa el `code` | Decidir Code vs Guid |
| Código demo puede no existir en BD | POST 404 | Mostrar `detail` | Semilla `mod-liderazgo-20241024` |
| CI API 4–10 vs UI 7–10 | CIs cortos rechazados en UI | UI más estricta | Alinear si hay CIs cortos |

## Preguntas abiertas

1. ¿Deep link con `Code` o `QrToken`?
2. ¿Registro público (sin auth), como está la API hoy?
3. ¿Producción same-origin o CORS?
4. ¿Existe en PostgreSQL `training_module.code = mod-liderazgo-20241024`?
