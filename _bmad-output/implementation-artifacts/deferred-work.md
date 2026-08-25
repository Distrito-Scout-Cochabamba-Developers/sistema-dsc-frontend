## Deferred from: code review of stories 1-1/1-2/1-3 (2026-08-25)

- Normalización de formato de CI (ceros a la izquierda, etc.) en `findByCi`/`findByCiInModule` — ligado al bug ya reportado del formato real de CI boliviano (SEGIP, 6-8 dígitos), no un defecto nuevo de esta feature.
- Sin acción de "eliminar" un participante añadido por error — los 3 criterios originales solo piden alta y corrección de campos, no borrado.
- Buscador de módulos (`module-list-page`) sin debounce — irrelevante mientras los datos sean de ejemplo (3 filas); revisar al conectar un backend real con muchos módulos.
