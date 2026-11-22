/**
 * Configuración de producción. `apiBaseUrl` vacío asume same-origin o reverse proxy.
 */
export const environment = {
  apiBaseUrl: '',
  /**
   * `true` cuando el backend publica GET/POST `/api/v1/calendar/sessions`.
   */
  trainingCalendarApiEnabled: true,
};
