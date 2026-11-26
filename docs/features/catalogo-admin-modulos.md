# Catálogo de módulos administrativo de módulos

- **Estado:** CRUD contra API + alta de programaciones
- **Ruta:** `/admin/modulos` (entrada: **Administrar módulos** en `/modulos`)
- **Roles:** `ADMIN`, `DISTRICT_SECRETARY`
- **Última actualización:** 2026-11-21

El catálogo de módulos (`training_module`) no tiene fecha. **Programar módulo** crea `training_module_session` + `training_module_schedule` y la publica en `/calendario`.

## Contrato API

| Método | Path | Notas |
| ------ | ---- | ----- |
| `GET` | `/api/v1/admin/modules` | Listado. `id`, `name`, `description`, `trainingLines`. |
| `POST` | `/api/v1/admin/modules` | `{ name, description, trainingLineCodes }` → 201 |
| `PUT` | `/api/v1/admin/modules/{id}` | Actualiza nombre, descripción y líneas |
| `DELETE` | `/api/v1/admin/modules/{id}` | 409 si hay asistencia, sesiones o plantillas |
| `GET` | `/api/v1/admin/training-lines` | PJ, GI, AE |
| `POST` | `/api/v1/admin/modules/{id}/sessions` | Programación: `schedules` con fecha y horas |

## Cómo probar

1. Login `pablo.rocha` / `1234`.
2. Módulos → **Administrar módulos**.
3. **Programar módulo** → fecha, inicio, fin → **Publicar en el calendario**.
4. `/calendario` muestra esa sesión.
