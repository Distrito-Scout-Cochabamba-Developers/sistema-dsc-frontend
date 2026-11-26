# Estándares de revisión del frontend

Usa el [contrato de desarrollo](./agents.md) para las reglas técnicas. Para cambios de UI, revisa el diff y la pantalla renderizada:

- **Móvil primero.** Recorre la tarea principal como dirigente en un ancho móvil antes de adaptar a escritorio. Revisa que el encabezado no desplace la tarea, que los controles se puedan tocar y que no haya desplazamiento horizontal. En escritorio, comprueba también el flujo administrativo afectado.
- **Reutilización.** Busca botones, campos, selectores y estados en [`src/app/shared/components`](./src/app/shared/components) antes de crear controles locales. Si falta una variante reutilizable, amplía el componente compartido cuando mantenga su alcance. Justifica en la revisión cualquier control local que duplique un patrón existente.
- **Jerarquía.** La pantalla debe dejar claro dónde estás, qué opción elegiste y cuál es el siguiente paso. Destaca una acción principal por paso. Mantén títulos, etiquetas y acciones secundarias coherentes con pantallas vecinas.
- **Tema DSC.** Usa los tokens semánticos de [`src/styles.css`](./src/styles.css). Comprueba contraste y foco; el hover no debe ocultar la selección. Si el estado se comunica visualmente solo con color, conserva su semántica accesible.
- **Evidencia.** Adjunta capturas o registra la comprobación en navegador a tamaños móvil y escritorio. Indica qué flujo y estados comprobaste y qué pruebas pasaron. Si falta acceso o un entorno funcional, declara la verificación pendiente: un build no sustituye la revisión visual.
