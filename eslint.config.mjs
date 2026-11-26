// @ts-check
// Configuración flat de ESLint (angular-eslint) para TypeScript y plantillas Angular.
// Política: los errores bloquean `pnpm lint`; las reglas estilísticas o ruidosas quedan en `warn`.
// Los errores de tipos y de plantilla los sigue detectando el compilador (`strictTemplates`) en `pnpm build`.
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

/** Rebaja a `warn` todas las reglas de un bloque de configuración (reglas de estilo, no de corrección). */
const asWarnings = (configs) =>
  configs.map((config) => ({
    ...config,
    rules: Object.fromEntries(
      Object.entries(config.rules ?? {}).map(([rule, value]) => {
        const severity = Array.isArray(value) ? value[0] : value;
        if (severity === 'off' || severity === 0) return [rule, value];
        return [rule, Array.isArray(value) ? ['warn', ...value.slice(1)] : 'warn'];
      }),
    ),
  }));

export default defineConfig(
  {
    ignores: ['dist/', 'out-tsc/', '.angular/', 'coverage/', 'graphify-out/', 'playwright-report/', 'test-results/'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      asWarnings(tseslint.configs.stylistic),
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Las pruebas usan aserciones y helpers locales; se mantienen las reglas, con menos ruido.
    files: ['**/*.spec.ts', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      // Estilo de plantilla: avisos, no bloquean.
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
      '@angular-eslint/template/prefer-control-flow': 'warn',
    },
  },
);
