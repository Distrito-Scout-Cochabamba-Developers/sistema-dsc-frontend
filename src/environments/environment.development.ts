/**
 * Configuración de desarrollo. Vacío: `ng serve` proxifica `/api` a `:5090`.
 */
export const environment = {
  apiBaseUrl: '',
  /**
   * `false`: la vista usa fixtures con la misma forma del contrato.
   * Activar al existir `GET/POST /api/v1/calendar/sessions`.
   */
  trainingCalendarApiEnabled: false,
};
