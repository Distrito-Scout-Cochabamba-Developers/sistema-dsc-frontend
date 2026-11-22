# 0008. Calendario frontend antes de API de convocatorias

- Estado: Accepted
- Fecha: 2026-11-15
- Decisores: Equipo frontend DSC
- Relacionado: [0001](./0001-mocks-frontend-antes-de-api.md)

## Contexto

Hace falta la vista de calendario e inscripción (Historia 2.2) sin endpoints de `TrainingModuleSession`. El usuario pidió frontend únicamente, preparado para cuando la API exista.

## Decisión

1. Ruta pública `/calendario` (cualquier usuario ve; inscribirse exige JWT).
2. Contrato HTTP documentado (`GET /api/v1/calendar/sessions`, `POST .../enrollments`) con DTOs camelCase.
3. `environment.trainingCalendarApiEnabled` (hoy `false`): el servicio usa fixtures de la misma forma. Activar el flag sustituye por `HttpClient` sin cambiar la UI.
4. Estado de tarjetas con Signals; 409 actualiza a **Cupo lleno**.
5. No se inventan rutas en el backend ni se llama a POST/PUT de otros recursos.

## Consecuencias

- Demos y tests de UX no dependen de la API.
- Producción con el flag en `false` muestra datos de demostración (banner visible). Hay que activar el flag al publicar los endpoints.
- Las fixtures no deben quedar como fuente de verdad: se retiran o se ignoran cuando `trainingCalendarApiEnabled` sea `true`.
