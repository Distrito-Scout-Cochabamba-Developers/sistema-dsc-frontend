---
status: approved
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "sistema-dsc-backend/_bmad-output/planning-artifacts/prd.md"
  - "sistema-dsc-backend/_bmad-output/project-context.md"
---

# Distrito Scout Cochabamba (DSC) - Desglose de Épicas e Historias

## Resumen

Este documento proporciona el desglose completo de épicas e historias de usuario para el Sistema de Gestión del Distrito Scout Cochabamba (Release 1: Diciembre 2026), derivado del PRD aprobado y las directrices de arquitectura Clean Architecture + DDD en .NET 10 / C# 14.

## Inventario de Requisitos

### Requisitos Funcionales (FRs)

- **FR-CAT-01**: Catálogo Extensible de Líneas y Niveles (Programa de Jóvenes, Gestión Institucional, Asesores de Formación; IM II, IM III, Paxtú Grupo/Distrito).
- **FR-CAT-02**: Parametrización de Módulos Obligatorios y Voluntarios con Regla de Vigencia (máx 2 años), Reutilización de Obligatorios entre niveles y Consumo Único de Ordinarios.
- **FR-CAT-03**: Versionado y Vigencias por Periodo de mallas curriculares por nivel.
- **FR-MOD-01**: Creación y Programación de Eventos de Módulo (nombre catálogo, líneas, niveles, disertante, fecha/hora, lugar, cupo máximo).
- **FR-MOD-02**: Tipificación de Disertantes (Interno con cuenta / Externo contacto sin cuenta).
- **FR-MOD-03**: Calendario de Módulos para Usuarios Autenticados con indicadores de estado y disponibilidad.
- **FR-MOD-04**: Inscripción Digital Autónoma antes del inicio del evento.
- **FR-MOD-05**: Bloqueo Estricto por Cupo alcanzado.
- **FR-MOD-06**: Registro Manual por Secretaría (búsqueda por CI, perfil mínimo dirigente, inscripción Rovers sin cuenta, respeto estricto de cupo).
- **FR-MOD-07**: Modificación, reprogramación o cancelación de módulos hasta la finalización del evento.
- **FR-ASI-01**: Checklist de Asistencia de Participantes (disertante interno o equipo de Adultos/Secretaría si es externo).
- **FR-ASI-02**: Acreditación institucional automática de presencia del disertante (sin checklist a disertante).
- **FR-ASI-03**: Definición de Módulo Cursado exclusivamente con asistencia registrada en firme.
- **FR-ASI-04**: Historial Formativo Individual de módulos cursados y dictados.
- **FR-ASI-05**: Conversión de Cuentas Rover a Dirigente preservando historial formativo previo.
- **FR-CUA-01**: Selección de Plantilla Oficial por Nivel (IM Nivel II: 1 Ciclo; IM Nivel III: 2 Ciclos).
- **FR-CUA-02**: Asignación y Validación Automática de Elegibilidad de APF (IM III previo, curso de asesores aprobado, Kárdex activo) y aceptación de tutoría.
- **FR-CUA-03**: Redacción Digital Estructurada de Secciones del Cuadernillo con autoguardado en borrador.
- **FR-CUA-04**: Cronograma de Ciclo Declarado y Cálculo de Hitos (6ta/8va reunión para 1er envío, cierre + 21 días para 2do envío, inicio + 365 días para 3er envío, reprogramación con aval de APF).
- **FR-FLX-01**: Flujo de Primer Envío (Planificación y Diagnóstico) con plazo SLA de 14 días para observaciones de Comisión Revisora.
- **FR-FLX-02**: Flujo de Segundo Envío (Evaluación de Ciclo y Subsanación) con plazo de 21 días post-ciclo y habilitación a 3er envío.
- **FR-FLX-03**: Flujo de Tercer Envío (Solicitud de Aprobación Final) con plazo máximo de 1 año desde inicio de práctica.
- **FR-FLX-04**: Cotejo Automático de Módulos Cursados, Vigencia (2 años), Reutilización de Obligatorios y Consumo Único de Ordinarios con carga de respaldos externos.
- **FR-FLX-05**: Dictamen Final de Formación (Aprobado, Observado, Vencido).
- **FR-FLX-06**: Generación de Expediente Consolidado Oficial en PDF foliado con firmas/avales.

### Requisitos No Funcionales (NFRs)

- **NFR-SEC-01**: Control de Acceso Basado en Roles (RBAC) estricto en API y frontend.
- **NFR-SEC-02**: Privacidad y Confidencialidad de Datos Personales (aislamiento de expedientes y kardex entre dirigentes).
- **NFR-SEC-03**: Inmutabilidad Histórica Post-Cierre de asistencias y cuadernillos dictaminados.
- **NFR-UX-01**: Experiencia Mobile-First en eventos presenciales (< 1.5s carga sin app nativa).
- **NFR-PER-01**: Soporte de Concurrencia de al menos 100 usuarios simultáneos en sala.
- **NFR-MNT-01**: Arquitectura Limpia (Clean Architecture) + DDD en .NET 10 / C# 14.
- **NFR-MNT-02**: Componentización y Tipado Estricto OpenAPI en Frontend.

### Requisitos Adicionales (Arquitectura & Backend Context)

- **ARCH-01**: Configuración de solución .NET 10 SDK modular: `DSC.Domain`, `DSC.Application`, `DSC.Infrastructure`, `DSC.Api`.
- **ARCH-02**: Modelado de Dominio rico sin setters públicos, exponiendo métodos de negocio que garanticen invariantes y Value Objects inmutables (`record struct`/`record class`).
- **ARCH-03**: Persistencia con EF Core 10 usando exclusivamente configuraciones `IEntityTypeConfiguration<T>`, `.AsNoTracking()` en lecturas y `.AsSplitQuery()` para grafos de agregados.
- **ARCH-04**: Manejo de errores global con Problem Details RFC 7807 y respuestas REST estandarizadas.
- **ARCH-05**: Testing unitario e integración con xUnit 2.9.3 y Coverlet en capas de Dominio y Aplicación.

### Requisitos de Diseño UX (Contrato Web)

- **UX-DR01**: Interfaz responsiva mobile-first para toma de asistencia en campo por lista rápida con checkboxes reactivos.
- **UX-DR02**: Formulario estructurado por pasos (wizard/acordeón) para redacción y guardado en borrador de cuadernillos IM II e IM III.
- **UX-DR03**: Tablero de seguimiento de hitos de cuadernillo con semáforo visual de plazos calculados (alertas de proximidad a 14 días / 21 días / 1 año).
- **UX-DR04**: Calendario mensual/lista de módulos con etiquetas de estado ("Próximo", "Cupo Lleno", "Finalizado", "Inscrito").

### Mapa de Cobertura de Requisitos

| Épica | Requisitos Funcionales Cubiertos | Requisitos Técnicos / NFR / UX |
|---|---|---|
| **Épica 1** | `FR-CAT-01`, `FR-CAT-02`, `FR-CAT-03` | `ARCH-01`, `ARCH-02`, `ARCH-03`, `NFR-SEC-01`, `NFR-SEC-02`, `NFR-MNT-01` |
| **Épica 2** | `FR-MOD-01`, `FR-MOD-02`, `FR-MOD-03`, `FR-MOD-04`, `FR-MOD-05`, `FR-MOD-06`, `FR-MOD-07` | `NFR-SEC-01`, `NFR-UX-01`, `UX-DR04` |
| **Épica 3** | `FR-ASI-01`, `FR-ASI-02`, `FR-ASI-03`, `FR-ASI-04`, `FR-ASI-05` | `NFR-PER-01`, `NFR-SEC-02`, `NFR-SEC-03`, `UX-DR01` |
| **Épica 4** | `FR-CUA-01`, `FR-CUA-02`, `FR-CUA-03`, `FR-CUA-04` | `UX-DR02`, `UX-DR03`, `ARCH-02` |
| **Épica 5** | `FR-FLX-01`, `FR-FLX-02` | `NFR-SEC-02`, `UX-DR03` |
| **Épica 6** | `FR-FLX-03`, `FR-FLX-04`, `FR-FLX-05`, `FR-FLX-06` | `NFR-SEC-03`, `ARCH-04`, `ARCH-05` |

---

## Lista de Épicas

1. **Épica 1: Catálogo de Formación y Mallas Curriculares**
2. **Épica 2: Programación, Calendario e Inscripción con Cupos**
3. **Épica 3: Control de Asistencia e Historial Formativo del Dirigente**
4. **Épica 4: Configuración y Redacción Digital de Cuadernillos**
5. **Épica 5: Flujo de Revisión: Envíos 1 y 2 con Plazos Normativos**
6. **Épica 6: Aprobación Final, Cotejo Curricular y Expediente PDF**

---

## Épica 1: Catálogo de Formación y Mallas Curriculares

**Objetivo:** Establecer la base transversal de autenticación segura RBAC y permitir a los responsables de formación del DSC gestionar las líneas, niveles y módulos del catálogo institucional, estructurando mallas de requisitos obligatorios y optativos con periodos de vigencia histórica que servirán de base para las inscripciones y el seguimiento de cuadernillos.

### Historia 1.0: Autenticación de Usuarios y Control de Acceso Basado en Roles (RBAC) [Azure DevOps #108]

Como **Dirigente Scout o Usuario Administrativo del Distrito**,  
quiero autenticarme de forma segura en la plataforma utilizando mi CI o nombre de usuario y contraseña,  
para acceder a las funciones correspondientes a mi rol (CAE, Secretaría, Disertante, Cursante, Asesor o Comisión Revisora) bajo aislamiento estricto de datos.

**Criterios de Aceptación:**

- **Dado** un usuario registrado con credenciales válidas en la base de datos distrital,
- **Cuando** envía sus credenciales al endpoint `/api/v1/auth/login`,
- **Entonces** el sistema valida el hash de contraseña y emite un token JWT Bearer firmado que incluye los claims de identidad, identificador de persona y roles asignados (`CAE`, `SD`, `DIS`, `CUR`, `APF`, `CRV`, `DD`),
- **Y** el frontend almacena el estado de sesión de forma reactiva en `AuthSessionService` mediante Angular Signals,
- **Y** `auth.interceptor.ts` inyecta automáticamente el token Bearer en cada petición HTTP subsiguiente,
- **Y** las rutas protegidas evalúan `AuthGuard` y `RoleGuard`, redirigiendo a login si el token ha expirado o denegando acceso si el usuario carece del rol exigido (`NFR-SEC-01`, `NFR-SEC-02`).

### Historia 1.1: Inicialización de Solución Clean Architecture y Dominio de Catálogo

Como **Arquitecto / Desarrollador Backend**,  
quiero inicializar la solución en .NET 10 con la estructura de capas de Clean Architecture y las entidades del catálogo de formación,  
para establecer las bases técnicas del sistema y modelar líneas y niveles con encapsulamiento DDD.

**Criterios de Aceptación:**

- **Dado** el repositorio backend configurado con .NET 10 SDK y C# 14,
- **Cuando** se compila la solución modular (`DSC.Domain`, `DSC.Application`, `DSC.Infrastructure`, `DSC.Api`),
- **Entonces** `DSC.Domain` no tiene dependencias de infraestructura ni frameworks web externos,
- **Y** se exponen entidades de dominio `TrainingLine` y `TrainingLevel` con identificadores fuertemente tipados y setters privados,
- **Y** la capa `DSC.Infrastructure` implementa las configuraciones EF Core 10 (`IEntityTypeConfiguration<T>`) para la persistencia del catálogo.

### Historia 1.2: Gestión de Catálogo de Módulos de Formación

Como **Responsable de Adultos en el Escultismo (`CAE`) o Secretaría**,  
quiero registrar, actualizar y consultar los módulos de formación disponibles en el distrito,  
para mantener un catálogo estandarizado utilizable en calendarios y mallas curriculares.

**Criterios de Aceptación:**

- **Dado** un usuario autenticado con rol `CAE`, `RFR` o `SD`,
- **Cuando** envía una solicitud para crear un módulo indicando nombre, código y descripción,
- **Entonces** el sistema valida que el nombre o código no estén duplicados en el catálogo activo,
- **Y** persiste la entidad `TrainingModule` con estado activo,
- **Y** permite consultar el listado completo mediante proyección de solo lectura `.AsNoTracking()`.

### Historia 1.3: Parametrización de Mallas Curriculares con Periodos de Vigencia

Como **Coordinador de Adultos en el Escultismo (`CAE`)**,  
quiero asociar módulos obligatorios y la cuota de módulos ordinarios/voluntarios a un nivel de formación con fechas de vigencia,  
para definir con precisión qué requisitos debe cumplir un dirigente para aprobar su nivel en cada periodo.

**Criterios de Aceptación:**

- **Dado** un nivel de formación (ej. Insignia de Madera Nivel II),
- **Cuando** el usuario `CAE` configura la malla indicando fecha de inicio, fecha de fin, lista de módulos obligatorios de línea y cantidad mínima de módulos ordinarios,
- **Entonces** el sistema registra el agregado `CurriculumPlan` con su periodo de vigencia,
- **Y** al consultar los requisitos aplicables a una fecha dada, el sistema resuelve la versión curricular vigente en ese momento histórico sin mutar planes de periodos anteriores.

---

## Épica 2: Programación, Calendario e Inscripción con Cupos

**Objetivo:** Permitir la creación de eventos de módulos con asignación de disertantes y cupos máximos, ofreciendo un calendario interactivo a los dirigentes para su inscripción autónoma y herramientas a Secretaría para registros asistidos y creación de perfiles mínimos.

### Historia 2.1: Programación y Gestión de Eventos de Módulo

Como **Responsable de Formación (`CAE`, `RFR`, `SD`)**,  
quiero programar un evento de módulo asignando expositor, fecha/hora, lugar y cupo máximo opcional,  
para abrir formalmente la convocatoria de capacitación a los dirigentes del distrito.

**Criterios de Aceptación:**

- **Dado** un módulo existente en el catálogo,
- **Cuando** el responsable programa una sesión definiendo si el disertante es interno (dirigente con cuenta) o externo (contacto sin cuenta con nombre y teléfono), fecha, lugar y cupo límite,
- **Entonces** el sistema valida que la fecha de inicio sea válida y crea el evento `ModuleSession` en estado `Programado`,
- **Y** permite editar fechas, lugar o cupo hasta antes de que finalice la sesión del evento.

### Historia 2.2: Consulta de Calendario e Inscripción Digital Autónoma con Control de Cupos

Como **Dirigente Scout autenticado**,  
quiero consultar los módulos próximos en el calendario e inscribirme a una sesión abierta,  
para asegurar mi participación y conocer la disponibilidad de cupos en tiempo real.

**Criterios de Aceptación:**

- **Dado** un dirigente autenticado que consulta el calendario de módulos,
- **Cuando** selecciona un módulo programado con cupos disponibles y pulsa "Inscribirme",
- **Entonces** el sistema registra su inscripción en la sesión vinculando su identificador de usuario,
- **Y** si se alcanza el cupo máximo configurado, el sistema cambia automáticamente el estado del evento a `Cupo Completo` y bloquea nuevas solicitudes de inscripción digital.

### Historia 2.3: Registro Manual de Participantes e Inscripción Asistida por Secretaría

Como **Secretaría del Distrito (`SD`)**,  
quiero inscribir manualmente a participantes buscando por Carnet de Identidad (CI), creando un perfil mínimo o inscribiendo a Rovers sin cuenta,  
para garantizar la inclusión de dirigentes sin acceso digital inmediato respetando estrictamente el cupo.

**Criterios de Aceptación:**

- **Dado** un evento de módulo con cupo disponible,
- **Cuando** Secretaría busca un CI existente en el sistema,
- **Entonces** el sistema asocia al dirigente a la lista de inscritos;
- **Y** si el CI no existe, permite crear un perfil mínimo con CI, Nombre, Apellido y Celular para habilitar su acceso posterior;
- **Y** permite registrar a un participante de rama Rover marcándolo como "Rover sin cuenta";
- **Y** si el módulo ya alcanzó el cupo máximo, el sistema rechaza la inscripción manual y exige ampliación explícita del cupo antes de proceder.

---

## Épica 3: Control de Asistencia e Historial Formativo del Dirigente

**Objetivo:** Proveer herramientas ágiles para que disertantes y equipo de formación registren la asistencia de participantes en sala mediante listas responsivas, acreditando el módulo en el historial individual únicamente a quienes asistieron efectivamente.

### Historia 3.1: Checklist Móvil de Asistencia Presencial en Sala

Como **Disertante Interno o Miembro de Formación / Secretaría**,  
quiero registrar la asistencia de los participantes en sala marcando un checklist rápido desde mi teléfono móvil,  
para acreditar la presencia efectiva de los cursantes de manera inmediata.

**Criterios de Aceptación:**

- **Dado** una sesión de módulo en curso o recién finalizada,
- **Cuando** el disertante interno (o Secretaría/Formación si el disertante es externo) abre la lista de participantes inscritos,
- **Entonces** la interfaz móvil carga de manera reactiva en menos de 1.5 segundos,
- **Y** permite marcar o desmarcar la casilla de asistencia para cada persona,
- **Y** el sistema no solicita ni requiere checklist de asistencia para el disertante (su presencia se acredita institucionalmente).

### Historia 3.2: Acreditación de Módulos e Historial Formativo del Dirigente

Como **Dirigente Scout**,  
quiero acceder a mi perfil para visualizar el historial completo de los módulos que he cursado y los que he dictado como disertante,  
para tener constancia oficial y transparente de mi trayectoria de capacitación.

**Criterios de Aceptación:**

- **Dado** un dirigente que consulta su historial formativo en la plataforma,
- **Cuando** se visualiza la sección de módulos cursados,
- **Entonces** el sistema muestra **exclusivamente** aquellos módulos en los que su asistencia fue confirmada en firme (las inscripciones sin asistencia quedan omitidas),
- **Y** muestra la fecha, nombre de módulo, nivel y disertante;
- **Y** si ha actuado como expositor interno, despliega una pestaña diferenciada con los módulos dictados;
- **Y** ningún otro dirigente regular puede acceder a esta información (privacidad estricta RBAC).

### Historia 3.3: Conversión de Cuenta Rover a Dirigente

Como **Secretaría del Distrito (`SD`)**,  
quiero convertir el registro de un participante Rover a dirigente activo con cuenta de acceso,  
para habilitar su ingreso a la plataforma preservando íntegro su historial de módulos cursados previamente.

**Criterios de Aceptación:**

- **Dado** un participante con registros previos bajo la categoría "Rover sin cuenta",
- **Cuando** Secretaría gestiona su promoción a Dirigente Scout vinculando su CI y correo electrónico,
- **Entonces** el sistema crea la cuenta de acceso y credenciales correspondientes,
- **Y** vincula automáticamente todas las asistencias históricas previas a su nuevo perfil de dirigente sin pérdida de datos.

---

## Épica 4: Configuración y Redacción Digital de Cuadernillos

**Objetivo:** Habilitar el inicio de la práctica supervisada mediante la selección de plantilla según nivel (IM II / IM III), la validación y aceptación del Asesor Personal de Formación (APF), la definición autónoma del cronograma del ciclo y la redacción digital estructurada con autoguardado.

### Historia 4.1: Selección de Plantilla Oficial y Vinculación de APF Elegible

Como **Dirigente en Formación (Postulante)**,  
quiero crear un nuevo expediente de cuadernillo seleccionando mi nivel (IM II o IM III) y asignando a mi Asesor Personal de Formación,  
para iniciar formalmente mi proceso de práctica supervisada bajo el reglamento distrital.

**Criterios de Aceptación:**

- **Dado** un dirigente autenticado que solicita iniciar práctica supervisada,
- **Cuando** selecciona la plantilla (IM II: 1 Ciclo de Programa; IM III: 2 Ciclos de Programa) y postula a su APF,
- **Entonces** el sistema valida que el asesor propuesto: (a) tenga Nivel IM III acreditado; (b) tenga curso de asesores aprobado; y (c) figure activo en el Kárdex distrital,
- **Y** notifica al APF para que acepte formalmente la tutoría en la plataforma antes de habilitar los envíos.

### Historia 4.2: Declaración del Cronograma de Ciclo y Cálculo Automatizado de Hitos

Como **Postulante con APF aceptado**,  
quiero registrar las fechas planificadas de reuniones semanales y cierre de ciclo de mi grupo scout,  
para que el sistema establezca las fechas límite oficiales para mis entregas y notifique los vencimientos.

**Criterios de Aceptación:**

- **Dado** un expediente de cuadernillo en etapa inicial,
- **Cuando** el postulante ingresa la fecha de inicio de práctica, el calendario de reuniones semanales y la fecha estimada de cierre de ciclo,
- **Entonces** el sistema calcula y fija:
  - Límite de 1er Envío: Fecha de la 6ta reunión registrada (8va en rama Rovers).
  - Límite de 2do Envío: Fecha de cierre de ciclo + 21 días calendario.
  - Límite de 3er Envío: Fecha de inicio de práctica + 365 días calendario;
- **Y** permite solicitar reprogramación de reuniones por imprevistos de grupo, requiriendo aprobación del APF en el sistema antes de que venza el plazo para recalcular las alertas.

### Historia 4.3: Redacción Digital Estructurada y Autoguardado en Borrador

Como **Postulante**,  
quiero redactar en línea las secciones de mi cuadernillo (acuerdos, entrevistas, ciclo de programa y evaluaciones) con guardado automático,  
para estructurar mi trabajo progresivamente sin riesgo de pérdida de información.

**Criterios de Aceptación:**

- **Dado** un cuadernillo activo,
- **Cuando** el postulante edita las secciones correspondientes a su nivel (datos personales, acuerdos de formación, entrevistas 1 y 2, planificación de ciclo),
- **Entonces** el sistema guarda automáticamente los borradores de forma periódica,
- **Y** valida la completitud de campos requeridos antes de permitir la acción formal de envío.

---

## Épica 5: Flujo de Revisión: Envíos 1 y 2 con Plazos Normativos

**Objetivo:** Gestionar las dos primeras entregas del cuadernillo digitalizando los plazos de revisión de la Comisión Revisora (SLA de 14 días), el registro de observaciones estructuradas, la comunicación con el asesor y la subsanación de correcciones.

### Historia 5.1: Presentación y Gestión del Primer Envío con SLA de Revisión

Como **Postulante**,  
quiero remitir formalmente mi Primer Envío dentro del plazo de mi 6ta/8va reunión,  
para que la Comisión Revisora evalúe mi diagnóstico, acuerdos de asesoría y planificación de ciclo.

**Criterios de Aceptación:**

- **Dado** un cuadernillo con el contenido inicial completado y validado por el APF,
- **Cuando** el postulante pulsa "Realizar Primer Envío" antes de la fecha límite calculada,
- **Entonces** el cuadernillo cambia a estado `Primer Envío en Revisión`,
- **Y** se activa un temporizador de 14 días calendario para la Comisión Revisora (`CRV`), alertando visualmente en el panel distrital de revisión.

### Historia 5.2: Registro de Observaciones de Comisión y Notificación al Asesor

Como **Miembro de la Comisión Revisora (`CRV`)**,  
quiero ingresar observaciones detalladas a las secciones del primer envío dentro del plazo reglamentario de 14 días,  
para orientar al postulante y a su APF en las correcciones requeridas para la siguiente etapa.

**Criterios de Aceptación:**

- **Dado** un expediente en estado `Primer Envío en Revisión`,
- **Cuando** la Comisión Revisora completa el formulario de evaluación con observaciones por sección y emite su dictamen preliminar,
- **Entonces** el estado del cuadernillo cambia a `Primer Envío Observado` (o `Aprobado sin observaciones`),
- **Y** el sistema envía una notificación digital inmediata al postulante y a su APF detallando las correcciones a subsanar en el segundo envío.

### Historia 5.3: Presentación de Segundo Envío, Subsanación y Habilitación a Tercer Envío

Como **Postulante guiado por su APF**,  
quiero presentar el Segundo Envío con el ciclo evaluado y las observaciones subsanadas dentro de los 21 días post-ciclo,  
para obtener la aprobación pedagógica de mi práctica y quedar habilitado al cierre de expediente.

**Criterios de Aceptación:**

- **Dado** un ciclo de programa finalizado,
- **Cuando** el postulante remite el segundo envío dentro de los 21 días posteriores a la fecha de cierre de ciclo, incluyendo la evaluación del ciclo, anexos y subsanaciones de observaciones,
- **Entonces** el cuadernillo ingresa a estado `Segundo Envío en Revisión`;
- **Y** al aprobar la Comisión la documentación subsanada, el expediente pasa al estado oficial `Habilitado para Tercer Envío`.

---

## Épica 6: Aprobación Final, Cotejo Curricular y Expediente PDF

**Objetivo:** Consolidar el expediente final en el tercer envío (máx 1 año), ejecutando el cotejo automático de módulos según las reglas de vigencia de 2 años, reutilización de obligatorios y consumo único de ordinarios, emitiendo el dictamen final y generando el documento PDF foliado.

### Historia 6.1: Presentación del Tercer Envío y Carga de Respaldos Externos

Como **Postulante**,  
quiero presentar mi Tercer Envío adjuntando certificados externos de cursos históricos y constancias de proyectos prioritarios,  
para solicitar la aprobación definitiva de mi nivel dentro del plazo máximo de un año.

**Criterios de Aceptación:**

- **Dado** un cuadernillo en estado `Habilitado para Tercer Envío` que no supera los 365 días desde el inicio de práctica,
- **When** el postulante inicia la solicitud de aprobación final y adjunta los archivos PDF/imágenes de respaldos externos (certificado de curso correspondiente, proyectos prioritarios y distritales),
- **Then** el sistema valida que todos los documentos obligatorios estén presentes y registra la solicitud en firme.

### Historia 6.2: Cotejo Automático de Módulos: Vigencia de 2 Años, Reutilización y Consumo Único

Como **Sistema de Formación Scout**,  
quiero verificar automáticamente el historial formativo del postulante frente a la malla curricular vigente,  
para garantizar el estricto cumplimiento de vigencias, reutilizaciones y consumos de módulos.

**Criterios de Aceptación:**

- **Dado** un tercer envío en proceso de validación curricular,
- **Cuando** el motor de validación contrasta los módulos cursados del postulante con la malla del nivel,
- **Entonces** verifica que cada módulo presentado haya sido cursado con asistencia hace menos de 2 años respecto a la fecha de inicio de práctica;
- **Y** si se trata de un módulo obligatorio de línea ya utilizado en IM II, permite su reutilización para IM III mientras conserve su vigencia;
- **Y** si se trata de un módulo ordinario/voluntario, verifica que no se encuentre en estado `Consumido` en un cuadernillo previo;
- **Y** si no cumple con la cuota mínima o hay módulos caducos, emite una alerta impidiendo el pase a dictamen final hasta subsanar la malla.

### Historia 6.3: Dictamen Final de Comisión y Generación de Expediente Consolidado PDF

Como **Comisión Revisora (`CRV`) y Dirección Distrital**,  
quiero emitir el dictamen formal de aprobación y generar el expediente consolidado foliado en PDF,  
para concluir oficialmente el proceso formativo y otorgar la certificación de nivel al dirigente.

**Criterios de Aceptación:**

- **Dado** un expediente con requisitos pedagógicos y módulos validados,
- **Cuando** la Comisión Revisora emite el dictamen de `Aprobado` (o `Rechazado/Vencido` si superó el plazo máximo),
- **Entonces** el sistema marca todos los módulos ordinarios utilizados en el expediente como `Consumido`, impidiendo su reutilización futura,
- **Y** congela el expediente como histórico inmutable (`NFR-SEC-03`),
- **Y** genera un documento PDF consolidado que unifica la carátula, secciones redactadas, avales digitales de APF/Comisión, registro de asistencia de módulos y foliación oficial.
