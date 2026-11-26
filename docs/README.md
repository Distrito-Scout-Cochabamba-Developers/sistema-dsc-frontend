# Documentación técnica — Sistema DSC Frontend

Índice de la documentación del proyecto para el equipo y los agentes.

| Documento | Contenido |
| --------- | --------- |
| [seguimiento.md](./seguimiento.md) | **Seguimiento**: hecho, en curso y pendiente |
| [features/auth-login.md](./features/auth-login.md) | Login JWT Bearer, Signals, guards |
| [features/auth-backend-gaps.md](./features/auth-backend-gaps.md) | Límites que quedan (logout, asistencia anónima) |
| [features/modulos-catalogo.md](./features/modulos-catalogo.md) | Listado `/modulos`; el formulario solo al elegir un módulo |
| [features/calendario-modulos.md](./features/calendario-modulos.md) | Calendario público `/calendario` e inscripción de dirigentes |
| [features/busqueda-secretaria.md](./features/busqueda-secretaria.md) | Consulta de solo lectura por Carnet de Identidad desde una programación |
| [features/calendario-backend-gaps.md](./features/calendario-backend-gaps.md) | GET/POST de programaciones que faltan |
| [features/catalogo-admin-modulos.md](./features/catalogo-admin-modulos.md) | Admin `/admin/modulos` (ADMIN / secretaría) |
| [features/catalogo-admin-backend-gaps.md](./features/catalogo-admin-backend-gaps.md) | POST/PUT y Authorize que faltan |
| [features/asistencia-registro.md](./features/asistencia-registro.md) | Feature de registro de asistencia (frontend) |
| [features/asistencia-registro-por-rol.md](./features/asistencia-registro-por-rol.md) | Futuro: admin/secretaría vs. autoinscripción |
| [features/contrato-api-asistencia.md](./features/contrato-api-asistencia.md) | Contrato HTTP lookup + register |
| [features/asistencia-backend-gaps.md](./features/asistencia-backend-gaps.md) | Límites de la API actual |
| [adr/](./adr/) | Architecture Decision Records |

## Contratos fuera de `docs/`

| Archivo | Rol |
| ------- | --- |
| [`agents.md`](../agents.md) | Contrato de desarrollo (prevalece) |
| [`CODING_STANDARDS.md`](../CODING_STANDARDS.md) | Estándares de revisión de UI |
| [`.claude/system-prompt.md`](../.claude/system-prompt.md) | Entrada al contrato para Claude |
| [Skill Angular](../.claude/skills/angular-developer/SKILL.md) | Guía técnica compartida |

## Cómo mantener el seguimiento

1. Actualizar [seguimiento.md](./seguimiento.md) al cerrar o abrir un ítem.
2. Documentar features nuevas bajo `docs/features/`.
3. Registrar decisiones de arquitectura en `docs/adr/` (ver plantilla en [adr/README.md](./adr/README.md)).
