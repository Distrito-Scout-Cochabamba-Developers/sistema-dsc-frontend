/**
 * Config de Playwright (E2E real: navegador + frontend + backend + Postgres,
 * sin mocks). El backend (con Postgres corriendo detrás) debe estar levantado
 * a mano en :5090 antes de correr `pnpm e2e` — este config solo levanta el
 * frontend automáticamente.
 *
 * Perfiles: `chromium` (escritorio) y `mobile-chromium` (Pixel 7, specs
 * `*.mobile.spec.ts`). Ejemplo: `pnpm exec playwright test --project=mobile-chromium`.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Escritorio: flujos administrativos (Secretaría, catálogo) y asistencia.
    {
      name: 'chromium',
      testIgnore: /\.mobile\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Móvil: flujo del dirigente. Pixel 7 usa Chromium; no requiere otro navegador.
    {
      name: 'mobile-chromium',
      testMatch: /\.mobile\.spec\.ts$/,
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
