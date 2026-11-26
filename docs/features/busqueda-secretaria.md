# Consulta por Carnet de Identidad de Secretaría

Ruta `/secretaria/convocatorias`, enlazada en la navegación exclusivamente para `DISTRICT_SECRETARY`. El guard exige ese mismo rol; la API valida el JWT de forma independiente.

1. El selector carga programaciones de `GET /api/v1/calendar/sessions`; no usa datos de demostración. Muestra módulo, fecha y hora de Bolivia e identificador de programación.
2. Tras seleccionar una programación, se consulta `POST /api/v1/secretariat/participants/lookup` con JSON `{ "ci": "5556667" }`. La selección es contexto local, no una inscripción. No se guarda el Carnet de Identidad en la URL ni en almacenamiento del navegador.
3. Con `200` se muestra una persona. Con `409` se solicita complemento (`extension` en el JSON) y, si persiste el conflicto, no se selecciona a nadie. El `404` con `type: urn:dsc:secretariat:participant-not-found` indica ausencia de coincidencia; los demás errores no se interpretan como ausencia.

Cambiar programación, Carnet de Identidad, complemento o cerrar sesión descarta la coincidencia previa. No hay alta, confirmación ni inscripción. No se integra con el QR de asistencia.

## Correo de activación tras el alta (AB#161)

Al crear dirigente e inscribir, la respuesta incluye `invitation` (`SENT` o `PENDING`). Si está `PENDING`, el panel conserva solo el identificador de la inscripción y ofrece "Reintentar envío del correo" (`POST /api/v1/secretariat/invitations/{id}/retry`, manual, solo Secretaría). El reintento nunca vuelve a inscribir. Un correo ya usado por otra cuenta (`409 email-in-use`) no crea nada. El panel no muestra ni guarda correo, usuario ni enlace.
