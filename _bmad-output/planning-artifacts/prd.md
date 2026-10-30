---
title: 'PRD — Sistema de Gestión Integral del Distrito Scout Cochabamba (DSC)'
status: 'approved'
created: '2026-10-14'
updated: '2026-10-15'
author: 'Winsor Orellana con BMad'
version: '2.0.0'
target_release: 'Diciembre 2026'
---

# Documento de Requisitos de Producto (PRD)
## Sistema de Gestión del Distrito Scout Cochabamba

---

## 1. Visión General y Objetivos de Producto

### 1.1 Declaración de Visión
Hacer fácil, ágil y transparente la gestión institucional del Distrito Scout Cochabamba para que los dirigentes voluntarios dediquen menos tiempo a planillas, transcripciones y persecución de documentos, y concentren su energía en el acompañamiento educativo de niños y jóvenes en el Programa de Jóvenes.

### 1.2 Problemas Clave a Resolver
1. **Pérdida de contexto y dispersión de datos:** La gestión en hojas manuscritas, planillas Excel y chats de WhatsApp genera inconsistencias, extravío de antecedentes y retrasos.
2. **Inconsistencias en formación de adultos:** Escritura ilegible o digitación errónea de CIs en listas presenciales; dirigentes sin visibilidad de su historial de módulos cursados y dificultad para verificar requisitos formativos.
3. **Complejidad y lentitud en cuadernillos de práctica supervisada:** Proceso manual basado en carpetas de Google Drive y mensajes informales, sin trazabilidad de plazos de revisión (14 días reglamentarios de la Comisión Revisora), sin control de versiones en las subsanaciones y sin validación cruzada con los módulos efectivamente cursados.

### 1.3 Principios Guía de Diseño
- **Simple y accesible:** Optimizado para dirigentes en campo (mobile-friendly), sin sobrecargar con burocracia digital.
- **Trazable y consistente:** Cada cambio de estado, asistencia o dictamen tiene un responsable explícito y fecha comprobable.
- **Inmutabilidad de antecedentes:** Los módulos cerrados y los dictámenes finales de cuadernillos constituyen registro histórico definitivo no editable.
- **Despliegue incremental:** Entrega enfocada en necesidades prioritarias (Release 1: Formación y Cuadernillos) sentando bases de arquitectura para capacidades futuras.

---

## 2. Taxonomía de Actores, Roles y Permisos

| Rol | Sigla | Descripción y Alcance en el Sistema |
| :--- | :---: | :--- |
| **Dirigente Cursante / Postulante** | `CUR` | Dirigente activo en formación. Consulta calendario, se inscribe a módulos, visualiza su historial de módulos cursados y redacta/sube entregas de su cuadernillo. |
| **Asesor Personal de Formación** | `APF` | Dirigente calificado que orienta al postulante. Registra entrevistas, retroalimenta el plan personal y avala los envíos del cuadernillo. Requisitos: IM Nivel III para PJ, registro activo en Kárdex distrital y curso de asesores aprobado. |
| **Disertante (Expositor)** | `DIS` | Facilitador de un módulo de formación. Si es dirigente con cuenta (`DIS-INT`), pasa lista y confirma asistencia en sala. Si es facilitador externo (`DIS-EXT`), es registrado como contacto sin cuenta. |
| **Comisión Revisora / Formación** | `CRV` | Equipo revisor de Adultos en el Escultismo del DSC. Revisa entregas de cuadernillos, emite observaciones formales en el plazo normativo (14 días) y aprueba dictámenes de nivel. |
| **Secretaría del Distrito** | `SD` | Gestión administrativa transversal. Registra participantes manualmente (búsqueda por CI o alta de perfil mínimo), asiste en toma de asistencia si el disertante es externo, y administra usuarios. |
| **Coordinador de Adultos en el Escultismo** | `CAE` | Responsable del área de formación. Administra el catálogo de módulos, programa calendario, define vigencias de mallas curriculares y supervisa comisiones de revisión. |
| **Responsable de Formación de Rama** | `RFR` | Responsable pedagógico por rama (Lobatos, Scouts, Scouters, Rovers). Crea y gestiona eventos de módulos en su ámbito correspondiente. |
| **Responsable de Grupo / Distrito** | `RGD` | Firma y valida cartas institucionales de planes de acción en niveles avanzados. |
| **Dirección Distrital** | `DD` | Supervisión general del distrito. Consulta reportes consolidados de avance de formación y cuadernillos. |

---

## 3. Arquitectura del Producto y Roadmap de Capacidades

```
+-----------------------------------------------------------------------------------+
|                        SISTEMA DE GESTIÓN DISTRITO SCOUT                          |
+-----------------------------------------------------------------------------------+
| RELEASE 1 (Objetivo: Diciembre 2026 - Prioridad Inmediata)                        |
| +-----------------------------------------+ +-----------------------------------+ |
| | MÓDULO 1: Módulos de Formación           | | MÓDULO 2: Cuadernillos IM II y III | |
| | - Catálogo común (líneas, niveles, malla)| | - Redacción digital estructurada | |
| | - Calendario & Bloqueo por cupos        | | - Flujo normativo de 3 envíos     | |
| | - Inscripción digital & Alta Secretaría | | - Asignación y validación de APF  | |
| | - Toma de asistencia & Historial        | | - Revisión Comisión (14 días SLA) | |
| | - Perfil mínimo / Rovers sin cuenta     | | - Cotejo automático de módulos    | |
| +-----------------------------------------+ +-----------------------------------+ |
+-----------------------------------------------------------------------------------+
| CAPACIDADES FUTURAS (Fases Posteriores)                                           |
| - Paxtú Nivel Grupo y Distrito (Gestión Institucional)                            |
| - Gestión autónoma de Ciclo de Programa y Permisos de Salida                      |
| - Reservas de Sede e Inventario de Materiales Distrital                           |
| - Finanzas, Caja Chica y Rendiciones Económicas                                   |
| - Comunicaciones, Repositorio Fotográfico y Portal Web Público                    |
| - Evaluaciones de satisfacción cruzada a disertantes                              |
+-----------------------------------------------------------------------------------+
```

---

## 4. Requisitos Funcionales — Release 1

### 4.1 Módulo Formación: Catálogo Común y Malla Curricular (`FR-CAT`)

*   **`FR-CAT-01` Catálogo Extensible de Líneas y Niveles**: Administración de líneas de formación (Programa de Jóvenes, Gestión Institucional, Adjuntos/Asesores de Formación) y niveles estructurados (Insignia de Madera Nivel II, Nivel III, Paxtú Grupo, Paxtú Distrito).
*   **`FR-CAT-02` Parametrización de Módulos Obligatorios y Voluntarios**:
    *   *Módulos Obligatorios de Línea:* Módulos troncales definidos por la malla (compartidos entre IM II e IM III). Reutilizables entre niveles siempre que conserven vigencia.
    *   *Módulos Ordinarios / Voluntarios:* Módulos optativos para completar el cupo curricular del nivel. Son de consumo único por cuadernillo.
    *   *Vigencia Temporal:* Todo módulo cursado (obligatorio u ordinario) tiene una vigencia máxima de 2 años respecto a la fecha de inicio de la práctica supervisada.
*   **`FR-CAT-03` Versionado y Vigencias por Periodo**: Cada relación de módulos obligatorios por nivel cuenta con fecha de inicio y fin de vigencia. Los cambios curriculares conservan la malla histórica aplicable a la fecha de inicio de la práctica del postulante.

### 4.2 Módulo Formación: Calendario, Cupos e Inscripción (`FR-MOD`)

*   **`FR-MOD-01` Creación y Gestión de Eventos de Módulo**: Los roles autorizados (`CAE`, equipo de Adultos, `RFR` y `SD`) programan módulos indicando: Nombre del módulo (del catálogo), Línea(s), Nivel(es), Disertante(s) asignado(s), Fecha/Hora de inicio y fin, Lugar, y Cupo máximo opcional.
*   **`FR-MOD-02` Tipificación de Disertantes**:
    *   *Disertante Interno:* Dirigente con cuenta en el sistema, vinculado a su perfil institucional.
    *   *Disertante Externo:* Profesional o expositor invitado registrado con datos de contacto (Nombre, Institución, Celular) sin cuenta de acceso.
*   **`FR-MOD-03` Calendario de Módulos para Autenticados**: Calendario visible para todo dirigente autenticado, mostrando módulos próximos y finalizados con indicadores visuales claros de estado y cupos disponibles.
*   **`FR-MOD-04` Inscripción Digital Autónoma**: El dirigente autenticado puede inscribirse en módulos abiertos hasta antes de la fecha y hora de inicio de la sesión.
*   **`FR-MOD-05` Bloqueo Estricto por Cupo**: Al alcanzarse el cupo máximo configurado, el sistema bloquea automáticamente nuevas inscripciones digitales y señala visualmente el estado de "Cupo Completo".
*   **`FR-MOD-06` Registro Manual por Secretaría (`SD`)**:
    *   Búsqueda por Carnet de Identidad (CI) para vincular a dirigentes existentes.
    *   Creación de perfil mínimo (CI, Nombre, Apellido, Celular) habilitando al dirigente a completar sus datos personales posteriormente.
    *   Inscripción manual de Rovers participantes sin generación de cuenta de acceso.
    *   *Regla de Invariante:* El cupo máximo aplica también a Secretaría; no se permite superar el cupo configurado salvo ampliación explícita del límite en el evento.
*   **`FR-MOD-07` Modificación y Cancelación de Módulos**: Un módulo puede ser editado, reprogramado o cancelado hasta la fecha/hora de finalización del evento. Una vez finalizado el evento, el registro se congela como histórico inmutable.

### 4.3 Módulo Formación: Asistencia e Historial del Dirigente (`FR-ASI`)

*   **`FR-ASI-01` Checklist de Asistencia de Participantes**:
    *   Si el disertante es interno (`DIS-INT`), dispone de acceso a la lista de inscritos de su sesión para marcar asistencia presencial.
    *   Si el disertante es externo (`DIS-EXT`), la toma de lista la realiza `SD`, `CAE`, el responsable de formación de rama o un miembro asignado del equipo de Adultos.
*   **`FR-ASI-02` Ausencia de Asistencia al Disertante**: El sistema no exige registro ni confirmación de asistencia del disertante; su presencia se da por acreditada institucionalmente al ejecutarse la sesión.
*   **`FR-ASI-03` Definición de Módulo Cursado**: Un módulo se computa y muestra como "Cursado" en el historial formativo de la persona **únicamente** cuando cuenta con asistencia registrada en firme. La sola inscripción no genera acreditación.
*   **`FR-ASI-04` Historial Formativo Individual**: Cada dirigente puede consultar en su perfil:
    *   Listado cronológico de módulos cursados (con fecha, nombre de módulo, disertante y nivel).
    *   Listado de módulos dictados como disertante (cuando aplique).
*   **`FR-ASI-05` Conversión de Cuentas Rover a Dirigente**: Cuando un Rover con participaciones previas asume funciones como dirigente, Secretaría asocia su CI al nuevo rol, habilitando credenciales de acceso y preservando intacto su historial previo de módulos cursados.

---

### 4.4 Módulo Cuadernillos: Plantillas y Asignación de APF (`FR-CUA`)

*   **`FR-CUA-01` Selección de Plantilla por Nivel**: El postulante inicia su trámite de práctica supervisada seleccionando la plantilla oficial según nivel:
    *   **Insignia de Madera Nivel II:** 1 Ciclo de Programa (diagnóstico, énfasis, selección de actividades, cronograma, reuniones y evaluación) + 3 entrevistas de asesoría.
    *   **Insignia de Madera Nivel III:** 2 Ciclos de Programa independientes (Ciclo 1 evaluado y Ciclo 2 planificado/evaluado) + entrevistas de asesoría asociadas.
*   **`FR-CUA-02` Asignación y Validación del Asesor Personal de Formación (APF)**:
    *   El postulante propone o selecciona a su APF registrado en la plataforma.
    *   El sistema valida automáticamente las reglas de elegibilidad: (a) Contar con Nivel IM III acreditado; (b) Tener aprobado el Curso de Asesores o Adjuntos de Formación; (c) Mantener registro activo en la base distrital.
    *   El APF debe aceptar formalmente la tutoría en la plataforma para habilitar el inicio de la práctica supervisada.
*   **`FR-CUA-03` Redacción Digital Estructurada**: La plataforma provee formularios estructurados por secciones (datos personales, acuerdos de formación, entrevistas, diseño y evaluación de ciclos de programa) permitiendo guardado en borrador incremental.
*   **`FR-CUA-04` Cronograma de Ciclo Declarado y Cálculo de Hitos**:
    *   *Autonomía del Grupo:* Al planificar el ciclo, el postulante registra: (1) Fecha de inicio de práctica; (2) Calendario de reuniones semanales planificadas; y (3) Fecha proyectada de cierre de ciclo.
    *   *Cálculo Automatizado de Plazos Límite:*
        *   Límite de 1er Envío = Fecha registrada de la 6ta reunión (8va reunión en rama Rovers).
        *   Límite de 2do Envío = Fecha registrada de cierre de ciclo + 21 días calendario.
        *   Límite de 3er Envío = Fecha de inicio de práctica supervisada + 365 días calendario.
    *   *Reprogramaciones:* El postulante puede solicitar ajuste de fechas de reuniones por imprevistos de grupo antes de su vencimiento, requiriendo aprobación explícita del APF en el sistema para recalcular el límite.

---

### 4.5 Módulo Cuadernillos: Flujo Normativo de Aprobación en 3 Envíos (`FR-FLX`)

El flujo digitaliza estrictamente el *Procedimiento para Aprobación de Cuadernillos de Formación* vigente del DSC:

```
[ POSTULANTE / APF ]                     [ COMISIÓN REVISORA (CRV) ]
        |                                             |
   (1er Envío) -------------------------------------> |
   Hasta 6ta/8va reunión                              | (Plazo revisión: máx 14 días)
        | <------------------------------------------ |
        |        Observaciones notificadas            |
        |                                             |
   (2do Envío) -------------------------------------> |
   Dentro de 21 días post-ciclo                       | (Revisión de subsanación)
        | <------------------------------------------ |
        |        Aprobación de 2do Envío              |
        |                                             |
   (3er Envío) -------------------------------------> |
   Máx 1 año desde inicio                             | (Dictamen final de nivel)
        | <------------------------------------------ |
        v                                             v
  [ EXPEDIENTE FINAL VALIDADO & APROBACIÓN CONCLUIDA ]
```

*   **`FR-FLX-01` Primer Envío (Planificación y Diagnóstico)**:
    *   *Plazo:* Hasta la fecha calculada de la 6ta reunión del ciclo (8va en Rovers) según cronograma declarado (`FR-CUA-04`).
    *   *Contenido IM II:* Plan Personal de Formación llenado; Conclusiones, recomendaciones y tareas de apoyo de 1ra y 2da entrevista; Ciclo de Programa completo planificado; Módulos cursados a la fecha; Informes iniciales del APF.
    *   *Contenido IM III:* Todo lo anterior, incluyendo el 1er Ciclo de Programa totalmente evaluado y el 2do Ciclo planificado.
    *   *Revisión de Comisión:* La Comisión Revisora (`CRV`) dispone de un plazo de hasta 14 días calendario para registrar observaciones en el sistema. Al registrarse, el sistema notifica al postulante y a su APF.
*   **`FR-FLX-02` Segundo Envío (Evaluación y Subsanación)**:
    *   *Plazo:* Hasta 21 días calendario posteriores a la fecha de conclusión del ciclo (del 2do ciclo en IM III) calculada según cronograma (`FR-CUA-04`).
    *   *Contenido IM II:* Cuadernillo con observaciones de la comisión subsanadas; Ciclo de programa evaluado con anexos de programas especiales; Conclusiones y tareas de apoyo de la 3ra entrevista.
    *   *Contenido IM III:* Cuadernillos subsanados con 1er y 2do ciclo evaluados con anexos; 3ra entrevista realizada.
    *   *Validación:* La Comisión Revisora valida la subsanación. Al aprobar, el cuadernillo cambia a estado `Habilitado para Tercer Envío`.
*   **`FR-FLX-03` Tercer Envío (Aprobación Final y Cierre de Expediente)**:
    *   *Plazo:* Periodo máximo de 1 año calendario computado desde la fecha de inicio formal de la práctica supervisada.
    *   *Contenido:* Cuadernillo integral subsanado y recopilación de respaldos probatorios.
*   **`FR-FLX-04` Cotejo Automático de Módulos, Vigencias y Consumo Único**:
    *   *Verificación de Malla Vigente:* El sistema valida automáticamente que el postulante cumpla con la cantidad y tipo de módulos exigidos para su nivel según la malla curricular vigente al inicio de su práctica.
    *   *Validación de Vigencia (2 Años):* El sistema descarta automáticamente para el cuadernillo cualquier módulo cuya fecha de asistencia supere los 2 años respecto a la fecha de inicio de la práctica supervisada.
    *   *Reutilización de Obligatorios:* Los módulos obligatorios de línea ya utilizados en IM II pueden ser reutilizados para IM III si siguen dentro de su ventana de vigencia de 2 años.
    *   *Consumo Único de Ordinarios:* Un módulo ordinario/voluntario solo puede asociarse a un único cuadernillo. Al ser aprobado el cuadernillo, el módulo queda en estado `Consumido` en el historial del dirigente, impidiendo su uso en cuadernillos posteriores.
    *   *Respaldos Externos:* Permite al postulante adjuntar certificados escaneados para cursos históricos o externos (ej. ASB nacional) y constancias de proyectos prioritarios y actividades distritales.
*   **`FR-FLX-05` Dictamen Final de Formación**: La Comisión Revisora emite dictamen: `Aprobado` (con fecha y resolución), `Observado` (con reintento dentro del plazo restante) o `Vencido` (al superar el año de plazo sin completar requisitos).
*   **`FR-FLX-06` Generación de Expediente Consolidado**: El sistema genera el expediente completo en formato PDF consolidado y foliado, conteniendo la totalidad del cuadernillo, firmas/avales digitales de APF y Comisión, e historial verificado.

---

## 5. Capacidades Futuras (Backlog Estratégico Post-R1)

Las siguientes áreas forman parte de la visión global del DSC pero **quedan fuera de los compromisos de entrega del Release 1**:

1.  **Gestión Institucional — Paxtú (Nivel Grupo y Nivel Distrito):** Implementación de la plantilla de plan de acción, flujo de 2 envíos, y validación de requisitos de Comité de Grupo y Plan de Grupo.
2.  **Ciclo de Programa Autónomo:** Herramienta independiente para dirigentes de sección (diagnóstico de rama, lluvia de ideas con jóvenes, selección de actividades y cronograma).
3.  **Reservas de Espacios e Inventario:** Calendario de reserva de ambientes de la Casa Scout (coordinación con Residencia y Secretaría), catálogo de materiales y control de préstamos por grupo scout.
4.  **Finanzas y Caja Chica:** Control de ingresos/egresos distritales, recibos de caja, aprobaciones de gastos mayores a 500 Bs y rendiciones de cuentas.
5.  **Comunicaciones y Banco Fotográfico:** Repositorio de recursos multimedia, curaduría de imágenes de eventos y portal web informativo para familias/público.
6.  **Evaluación de Satisfacción a Disertantes:** Formulario de retroalimentación docente completado por los cursantes al término de cada módulo.
7.  **Registro y Membresía de Beneficiarios:** Integración o consulta con sistemas nacionales de ASB para seguimiento de membresía de niños y jóvenes.

---

## 6. Requisitos No Funcionales (NFRs)

### 6.1 Seguridad, Roles e Integridad
*   **`NFR-SEC-01` Control de Acceso Basado en Roles (RBAC):** Autorización estricta por permisos en endpoints de backend y directivas de navegación en frontend.
*   **`NFR-SEC-02` Privacidad de Datos Personales:** Los dirigentes solo tienen visibilidad de su propio perfil y progreso. Las listas completas de cursantes y cuadernillos ajenos solo son accesibles por Secretaría, Comisión Revisora, Adultos en el Escultismo y Dirección Distrital.
*   **`NFR-SEC-03` Inmutabilidad Post-Cierre:** Una vez cerrada la asistencia de un módulo o emitido el dictamen final de un cuadernillo, los registros son de solo lectura y cualquier ajuste posterior requiere pista de auditoría administrativa.

### 6.2 Rendimiento y Experiencia de Usuario
*   **`NFR-UX-01` Mobile-First en Operaciones Presenciales:** La visualización de calendario, inscripción y toma de lista de asistencia deben cargar en menos de 1.5 segundos en dispositivos móviles con conexiones 3G/4G sin requerir instalación de apps.
*   **`NFR-PER-01` Concurrencia en Salas de Módulos:** Capacidad de soportar toma de lista y consultas simultáneas de hasta 100 usuarios concurrentes sin degradación de servicio.

### 6.3 Mantenibilidad y Estándares de Ingeniería
*   **`NFR-MNT-01` Clean Architecture + DDD en Backend:** Cumplimiento estricto de separación de capas (`DSC.Domain`, `DSC.Application`, `DSC.Infrastructure`, `DSC.Api`) en .NET 10 y C# 14.
*   **`NFR-MNT-02` Componentización y Tipado en Frontend:** Arquitectura modular basada en componentes y tipado riguroso alineado a los contratos OpenAPI expuestos por el backend.

---

## 7. Criterios de Aceptación y Verificación de Release 1

1.  **Gestión de Módulo Completa:** Un responsable de formación puede programar un módulo; los dirigentes autenticados pueden inscribirse hasta copar el cupo; el disertante marca asistencia en sala; y únicamente los asistentes ven reflejado el módulo en su historial.
2.  **Registro Asistido por Secretaría:** Secretaría puede buscar por CI a un dirigente existente o crear un perfil mínimo con CI y celular para inscribirlo manualmente respetando el cupo.
3.  **Flujo Integral de Cuadernillo IM II:** Un postulante selecciona su plantilla y APF calificado; envía el 1er envío; la comisión emite observaciones dentro de los 14 días reglamentarios; el postulante sube el 2do envío con el ciclo evaluado; la comisión aprueba el paso al 3er envío; y al completarse los requisitos, se genera el expediente consolidado y dictamen final.
4.  **Cotejo Automático de Módulos con Vigencias y Consumo Único:** Al momento de la solicitud de aprobación (3er envío), el sistema valida automáticamente: (a) que los módulos presentados tengan menos de 2 años desde su dictado; (b) que los módulos ordinarios no hayan sido consumidos en un cuadernillo previo; y (c) que los módulos obligatorios de línea coincidan con la malla vigente, permitiendo su reutilización si provienen de IM II y conservan vigencia.
