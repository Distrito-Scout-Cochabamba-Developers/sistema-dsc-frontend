# Feature: Registro de asistencia a módulo

- **Estado:** Catálogo en `/modulos` (GET API). El formulario de asistencia solo se abre al elegir un módulo. Login **completado**. Registro **según rol** pendiente de API.
- **Rutas:** `/modulos` → `/asistencia/:sessionId`
- **Demo:** `/asistencia/mod-liderazgo-20241024`
- **Última actualización:** 2026-10-16

## User story

Como Dirigente Scout (Participante), quiero registrar mi asistencia a un módulo de formación ingresando mis datos desde mi dispositivo, para evitar errores en la transcripción de mi Carnet de Identidad y asegurar que mi participación sea registrada correctamente.

## Arquitectura

```text
src/app/
├── core/
│   ├── models/attendance.models.ts
│   ├── models/attendance-api.models.ts
│   └── services/training-modules.service.ts
├── features/modules/          # listado; click → /asistencia/:code
├── features/attendance/       # formulario (no se muestra en el catálogo)
└── layout/main-layout/
```

Listado: [modulos-catalogo.md](./modulos-catalogo.md). Contrato: [contrato-api-asistencia.md](./contrato-api-asistencia.md). Gaps: [asistencia-backend-gaps.md](./asistencia-backend-gaps.md).

## Pendiente fuera de este frontend

- [x] Auth real (login JWT Bearer + `/me`) — ver [auth-login.md](./auth-login.md)
- [x] GET de catálogo / módulo por código (`GET /api/attendance/modules`)
- [ ] QR generado por admin
- [ ] CORS o reverse proxy en producción
- [ ] Registro a módulos según rol (admin/secretaría vs. autoinscripción) — ver [asistencia-registro-por-rol.md](./asistencia-registro-por-rol.md)
