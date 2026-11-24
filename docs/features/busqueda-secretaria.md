# Consulta por CI de Secretaría

Ruta `/secretaria/convocatorias`, enlazada en la navegación exclusivamente para `DISTRICT_SECRETARY`. El guard exige ese mismo rol; la API valida el JWT de forma independiente.

1. El selector carga convocatorias de `GET /api/v1/calendar/sessions`; no usa datos de demostración. Muestra módulo, fecha y hora de Bolivia e identificador de convocatoria.
2. Tras seleccionar una convocatoria, se consulta `POST /api/v1/secretariat/participants/lookup` con JSON `{ "ci": "5556667" }`. La selección es contexto local, no una inscripción. No se guarda el CI en la URL ni en almacenamiento del navegador.
3. Con `200` se muestra una persona. Con `409` se solicita complemento (`extension` en el JSON) y, si persiste el conflicto, no se selecciona a nadie. El `404` con `type: urn:dsc:secretariat:participant-not-found` indica ausencia de coincidencia; los demás errores no se interpretan como ausencia.

Cambiar convocatoria, CI, complemento o cerrar sesión descarta la coincidencia previa. No hay alta, confirmación ni inscripción. No se integra con el QR de asistencia.
