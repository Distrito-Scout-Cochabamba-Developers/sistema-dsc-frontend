# Documentación técnica — Sistema DSC Frontend

Índice de la documentación de proyecto (conocimiento de largo plazo para humanos y agentes BMAD).

| Documento | Contenido |
| --------- | --------- |
| [seguimiento.md](./seguimiento.md) | **Seguimiento**: hecho, en curso y pendiente |
| [features/asistencia-registro.md](./features/asistencia-registro.md) | Feature de registro de asistencia (frontend) |
| [adr/](./adr/) | Architecture Decision Records |

## Contratos fuera de `docs/`

| Archivo | Rol |
| ------- | --- |
| [`agents.md`](../agents.md) | Contrato de desarrollo (prevalece) |
| [`_bmad-output/project-context.md`](../_bmad-output/project-context.md) | Contexto BMAD brownfield |
| [`.cloude/system-prompt.md`](../.cloude/system-prompt.md) | System prompt de agentes |
| [`.cloude/angular-developer/`](../.cloude/angular-developer/SKILL.md) | Skill Angular compartida |

## Cómo mantener el seguimiento

1. Actualizar [seguimiento.md](./seguimiento.md) al cerrar o abrir un ítem.
2. Documentar features nuevas bajo `docs/features/`.
3. Registrar decisiones de arquitectura en `docs/adr/` (ver plantilla en [adr/README.md](./adr/README.md)).
