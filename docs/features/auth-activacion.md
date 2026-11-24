# Activación de cuenta (AB#162)

Enlace de invitación: `/auth/activar#token=<token>` en el origen HTTPS del frontend. El fragmento no se envía al servidor. La página no canjea al cargar ni guarda el secreto en almacenamiento; solo lo envía al confirmar una contraseña válida y coincidente.

`POST /api/v1/auth/activate` recibe `{ token, password }`. `204` confirma la activación, retira el fragmento e invita a iniciar sesión; no establece sesión. `400` muestra cómo recuperar acceso sin revelar si el enlace ya fue usado, caducó o es inválido. El alta, correo y reintentos son de AB#161.
