# Gaps del backend — calendario e inscripción

Cerrado el 2026-11-21: existen `GET /api/v1/calendar/sessions` y `POST .../enrollments`. Ver [calendario-modulos.md](./calendario-modulos.md) y el contrato en el backend (`docs/features/calendario-sesiones.md`).

Pendiente de producto (no bloquea el calendario):

| Gap | Notas |
| --- | ----- |
| UI admin de convocatorias | El alta es `POST /api/v1/admin/modules/{id}/sessions` (Scalar). |
| Varios bloques / varios días | Una tarjeta; la grilla pinta el día de `startsAt`. |
| Inscripción asistida por Secretaría | Historia 2.3, fuera de esta entrega. |
