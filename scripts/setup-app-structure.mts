/**
 * Crea la estructura de carpetas enterprise bajo `src/app/` y `docs/adr`.
 *
 * Ejecutar desde la raíz del repo:
 * `pnpm structure` (usa Node con type-stripping, sin JavaScript).
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');

/** Directorios que deben existir en un workspace listo para agentes. */
const DIRECTORIES: readonly string[] = [
  'src/app/core/guards',
  'src/app/core/interceptors',
  'src/app/core/services',
  'src/app/core/tokens',
  'src/app/shared/components',
  'src/app/shared/directives',
  'src/app/shared/pipes',
  'src/app/shared/utils',
  'src/app/features',
  'src/app/layout',
  'src/app/docs',
  'docs/adr',
];

/**
 * Asegura la existencia de un directorio y un `.gitkeep` si está vacío de tracked files.
 *
 * @param relativePath - Ruta relativa a la raíz del repositorio.
 */
function ensureDirectory(relativePath: string): void {
  const absolutePath = join(ROOT, relativePath);
  mkdirSync(absolutePath, { recursive: true });

  const gitkeep = join(absolutePath, '.gitkeep');
  if (!existsSync(gitkeep)) {
    writeFileSync(gitkeep, '');
  }
}

for (const directory of DIRECTORIES) {
  ensureDirectory(directory);
}

console.log('Estructura enterprise lista (TypeScript-only tooling).');
