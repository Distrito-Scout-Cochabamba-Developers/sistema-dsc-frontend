# Feature: Registro de asistencia a módulo

- **Estado:** Integrado con lookup y POST de la API; auth y GET de sesión pendientes en backend
- **Ruta:** `/asistencia/:sessionId`
- **Demo:** `/asistencia/mod-liderazgo-20241024`
- **Última actualización:** 2026-08-18

## User story

Como Dirigente Scout (Participante), quiero registrar mi asistencia a un módulo de formación ingresando mis datos desde mi dispositivo, para evitar errores en la transcripción de mi Carnet de Identidad y asegurar que mi participación sea registrada correctamente.

## Arquitectura

```text
src/app/
├── core/
│   ├── models/attendance.models.ts
│   ├── models/attendance-api.models.ts
│   ├── interceptors/
│   └── services/adult-directory.service.ts
├── features/attendance/
│   ├── attendance-page.ts
│   ├── components/attendance-form.ts
│   └── services/attendance-registration.service.ts
└── layout/main-layout/
```

Ver [contrato-api-asistencia.md](./contrato-api-asistencia.md) y [asistencia-backend-gaps.md](./asistencia-backend-gaps.md).

## Pendiente fuera de este frontend

- [ ] Auth real (no hay API de login)
- [ ] GET de sesión / convocatoria
- [ ] QR generado por admin
- [ ] CORS o reverse proxy en producción
