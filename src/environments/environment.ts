/**
 * Configuración de producción. `apiBaseUrl` vacío asume same-origin o reverse proxy.
 */
export const environment = {
  apiBaseUrl: '',
  /**
   * `false` hasta que el backend publique GET/POST de calendario.
   * Poner en `true` al conectar ` /api/v1/calendar/sessions`.
   */
  trainingCalendarApiEnabled: false,
};
