# Gaps del backend — catálogo administrativo

CRUD admin **completo** (`GET/POST/PUT/DELETE /api/v1/admin/modules` y `GET /module-types`) con `ADMIN` / `DISTRICT_SECRETARY`.

| Gap | Impacto | Mitigación | Falta en API |
| --- | --- | --- | --- |
| GET público de asistencia sigue anónimo | Cualquiera lista el catálogo de inscripción | Es intencional para `/modulos` | — |

Pregunta abierta: ¿el código de un módulo debe poder cambiarse? Hoy es inmutable (PUT usa el `{code}` de la ruta).
