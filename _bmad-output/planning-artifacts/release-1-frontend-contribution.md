---
title: "Contribución frontend al release inicial DSC"
status: "draft"
updated: "2026-10-14"
---

# Contribución frontend al release inicial DSC

Este artefacto registra el alcance y las preguntas frontend necesarias para que el repositorio sea entendible sin el workspace local del usuario. El release product brief general está en planificación BMAD del backend, junto al PRD previo que debe conciliarse. Esta contribución no sustituye el diseño UX ni la especificación de producto.

## Alcance objetivo expresado por el usuario

Para el release de diciembre, el usuario quiere terminar inicialmente:

1. **Módulos de formación:** experiencia para que un dirigente cursante se inscriba y consulte los módulos cursados.
2. **Cuadernillos de formación:** experiencia para que un dirigente redacte su cuadernillo digitalmente mediante secciones de plantilla según nivel y consulte el avance de revisión y observaciones. El alcance de este release contempla únicamente Insignia de Madera (IM) nivel II y III.
3. **Catálogo compartido de módulos:** navegación/selección de módulos como base común de los dos flujos.

Los demás módulos pueden entrar si hay capacidad, pero no están comprometidos en el alcance base. Se debe confirmar el año del hito de diciembre y si significa demo, piloto o producción.

### Alcance de plantillas

- **IM nivel II:** la plantilla organiza datos del postulante/asesor, plan personal de formación, tres entrevistas, un Ciclo de Programa (incluye planificación y evaluación), módulos, informe del asesor y solicitud/requisitos de aprobación.
- **IM nivel III:** usa secciones de práctica y aprobación propias del nivel, con dos Ciclos de Programa y entrevistas relacionadas. En el primer envío contempla el primer ciclo evaluado y el segundo planificado.
- Las plantillas de Gestión Institucional (Paxtú) nivel Grupo y Distrito quedan fuera del release inicial; se consideran para releases futuros.
- El procedimiento recibido describe tres entregas PDF, subsanación de observaciones de la Comisión revisora y plazos, utilizando Drive y comunicación por WhatsApp. Es evidencia del proceso actual; debe validarse su vigencia y decidirse cómo se integra con autoría/revisión dentro del sistema y si se genera un PDF final consolidado.

## Azure Boards relacionado

- [#30 — Control de Módulos de Formación (Epic)](https://dev.azure.com/wimpi/Sistema%20Distrito%20Scout%20Cochabamba/_workitems/edit/30)
- [#31 — Registro Digital de Asistencia a Módulos](https://dev.azure.com/wimpi/Sistema%20Distrito%20Scout%20Cochabamba/_workitems/edit/31) — `Doing`
- [#32 — Registro Manual y Corrección de Participantes por Secretaría](https://dev.azure.com/wimpi/Sistema%20Distrito%20Scout%20Cochabamba/_workitems/edit/32) — `Doing`
- [#33 — Consulta y Búsqueda de Módulos Completados](https://dev.azure.com/wimpi/Sistema%20Distrito%20Scout%20Cochabamba/_workitems/edit/33) — `Doing`
- [#68 — Carga de Cuadernillos y Ciclos para Revisión](https://dev.azure.com/wimpi/Sistema%20Distrito%20Scout%20Cochabamba/_workitems/edit/68) — `To Do`
- [#69 — Asignación Equitativa de Evaluadores de Carpetas](https://dev.azure.com/wimpi/Sistema%20Distrito%20Scout%20Cochabamba/_workitems/edit/69) — `To Do`
- [#71 — Revisión de Expediente mediante Checklist y Registro de Observaciones](https://dev.azure.com/wimpi/Sistema%20Distrito%20Scout%20Cochabamba/_workitems/edit/71) — `To Do`
- [#108 — Autenticación](https://dev.azure.com/wimpi/Sistema%20Distrito%20Scout%20Cochabamba/_workitems/edit/108) — `To Do`

Estados consultados el 2026-10-14; refrescar antes de replanificar o cambiar Boards.

## Cuestiones de diseño/experiencia aún abiertas

- El usuario confirmó que el dirigente debe **escribir el cuadernillo dentro del sistema** usando la plantilla correspondiente al nivel; se confirmaron IM II y III para este release. #68, centrada en cargar PDF/Word, no cubre por sí sola ese objetivo; revisar su alcance y la generación del PDF consolidado que exige el procedimiento recibido.
- La historia #71 asume un expediente PDF en visor; definir cómo se revisan secciones estructuradas, se registran observaciones/subsanaciones y se relacionan con las entregas PDF del procedimiento.
- La consulta de módulos #33 incluye búsqueda pública por CI y descarga/certificado. Definir privacidad, inicio de sesión y quién puede consultar historiales ajenos antes de diseñar pantallas.
- #31 mezcla inscripción/asistencia a una sesión con QR; acordar diferencia entre inscribirse a futuro y registrar presencia al cursar.
- Identificar estados y acciones visibles para cursante, Secretaría, Responsable de Formación y evaluador; aún no asumir asignación automática ni notificaciones específicas.
- Identificar catálogo, fuente de datos, creación/edición, vigencia y relación entre módulos, sesiones, inscripción, historial y cuadernillos.
- Diseñar las plantillas de IM II y III sin homogeneizar sus diferencias (uno frente a dos ciclos de programa); definir cómo versionar cambios de plantilla y cómo mostrar borradores, campos repetibles, revisión y documentos de respaldo.

## Próximos artefactos frontend

Después de aclarar el flujo, desarrollar `DESIGN.md` y `EXPERIENCE.md` en `_bmad-output/planning-artifacts/` mediante `bmad-ux`, manteniendo estos criterios y enlazando historias reales de Azure Boards. No reutilizar supuestos del diseño actual si contradicen decisiones de producto confirmadas.
