# Catálogo administrativo de módulos

- **Estado:** CRUD contra API (incluye DELETE)
- **Ruta:** `/admin/modulos` (entrada: **Administrar módulos** en `/modulos`)
- **Roles:** `ADMIN`, `DISTRICT_SECRETARY`
- **Última actualización:** 2026-10-22

## Contrato API

| Método | Path | Notas |
| ------ | ---- | ----- |
| `GET` | `/api/v1/admin/modules` | Listado. Bearer + rol. |
| `POST` | `/api/v1/admin/modules` | `{ code, name, description, moduleTypeCode }` → 201 |
| `PUT` | `/api/v1/admin/modules/{code}` | Actualiza nombre, descripción y tipo |
| `DELETE` | `/api/v1/admin/modules/{code}` | Baja. 409 si hay asistencia, sesiones o plantillas |
| `GET` | `/api/v1/admin/module-types` | Select de tipos (`AE`, `PJ`, …) |

Scalar: http://localhost:5090/scalar/v1. Doc backend: `sistema-dsc-backend/docs/features/admin-catalogo-modulos.md`.

El GET anónimo `/api/attendance/modules` sigue para `/modulos` (inscripción).

## Cómo probar

1. Login `pablo.rocha` / `1234` o `maricel.rocha` / `1234`.
2. Módulos → **Administrar módulos**.
3. Nuevo / Editar → **Guardar**. Eliminar → confirmar en el modal.
