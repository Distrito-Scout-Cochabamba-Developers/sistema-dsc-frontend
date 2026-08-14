# Feature: Registro de asistencia a módulo

- **Estado:** Frontend mock completo; integración API pendiente
- **Ruta:** `/asistencia/:sessionId`
- **Demo:** `/asistencia/mod-liderazgo-20241024`
- **Última actualización:** 2026-08-04

## User story

Como Dirigente Scout (Participante), quiero registrar mi asistencia a un módulo de formación ingresando mis datos desde mi dispositivo, para evitar errores en la transcripción de mi Carnet de Identidad y asegurar que mi participación sea registrada correctamente.

## Acceptance criteria (tracking)

| # | Criterio | Frontend | Backend |
| - | -------- | -------- | ------- |
| 1 | Acceso por link directo o QR de la sesión | Hecho (`sessionId` en ruta) | Pendiente generar QR |
| 2 | Obligatorios: Nombre, CI, Extensión, Teléfono | Hecho | Validar en API |
| 3 | CI valida numérico (evita letras / celulares mal puestos) | Hecho (7–10 dígitos) | Revalidar servidor |
| 4 | Si CI existe en adultos del distrito → autocomplete nombre | Hecho (mock) | Endpoint lookup |
| 5 | Mensaje de éxito con resumen del módulo | Hecho | Confirmar payload real |
| 6 | Si está autenticado → recuperar perfil y precargar | Hecho (mock sesión) | Auth real |
| 7 | Si no está en el sistema → carga manual + registro parcial | Hecho (flag) | Persistencia parcial |

## Arquitectura en el repo

```text
src/app/
├── core/
│   ├── models/asistencia.models.ts
│   ├── utils/ci.utils.ts
│   └── services/
│       ├── auth-session.service.ts      # sesión mock
│       └── adultos-directory.service.ts # lookup CI + sesión módulo (mock)
├── features/asistencia/
│   ├── asistencia-page.ts               # UI + Signal Forms
│   ├── asistencia.routes.ts
│   └── services/asistencia-registro.service.ts  # POST mock
└── layout/main-layout/main-layout.ts    # navbar / footer DSC
```

## Flujos UI

1. **Autenticado:** banner amarillo + datos precargados → confirmar → éxito.
2. **CI conocido (sin sesión o con sesión):** debounce lookup → autocomplete → registrar.
3. **CI desconocido:** mensaje de registro parcial → usuario completa datos → éxito con aviso parcial.
4. **Sesión inválida:** mensaje de error y enlace al inicio.

## Datos mock actuales

| CI | Nombre | Extensión |
| -- | ------ | --------- |
| `12345678` | Juan Pérez Mendoza | LP |
| `87654321` | María López Quispe | CB |

Sesión demo: `mod-liderazgo-20241024` (Módulo de Liderazgo y Servicio).

## Pendiente para cerrar la feature

Ver ítems **A-09 … A-15** y **B-01 … B-05** en [seguimiento.md](../seguimiento.md).

Resumen:

- [ ] Contratos HTTP (lookup adulto, registrar asistencia, obtener sesión)
- [ ] Sustituir mocks por `HttpClient`
- [ ] Auth real (token / cookie) y pantalla de login
- [ ] Tests unitarios de validación CI y estados de UI
- [ ] QR generado por admin/facilitador apuntando a `/asistencia/{sessionId}`

## Notas para agentes

- Respetar `agents.md`: standalone, inline templates, Signals + RxJS, JSDoc.
- No nombrar carpetas de feature `home` (Tailwind las ignora).
- Ante conflicto de diseño vs contrato técnico, gana `agents.md`.
