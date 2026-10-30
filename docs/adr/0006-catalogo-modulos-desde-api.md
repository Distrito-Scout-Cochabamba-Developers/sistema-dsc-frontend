# 0006. Catálogo de módulos desde la API

- Estado: Accepted
- Fecha: 2026-10-16
- Decisores: Equipo DSC
- Relacionado: [0004](./0004-integracion-http-asistencia.md)

## Contexto

El ADR 0004 resolvía metadatos de sesión en el cliente (cualquier `sessionId` abría el formulario; el POST validaba el código). Hacía falta listar módulos **desde PostgreSQL** y mostrar el formulario **solo al elegir uno**. Eso no se puede hacer de forma fiable sin un GET.

## Decisión

- Backend: `GET /api/attendance/modules` y `GET /api/attendance/modules/{code}` (`TrainingModule.Code`).
- Frontend: feature `modules/` en `/modulos`; `/asistencia/:sessionId` consume el GET por código.
- 404 o código vacío → «Sesión no válida», sin formulario.

## Consecuencias

- El catálogo vacío es un estado válido (`[]`).
- Deep links rotos ya no fabrican una sesión local.
- Hace falta semilla de `training_module` (y de tipos de contacto para el POST). El GET de convocatoria (fecha/horario) sigue pendiente.
