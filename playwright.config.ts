/**
 * Config de Playwright (E2E real: navegador + frontend + backend + Postgres,
 * sin mocks). El backend (con Postgres corriendo detrás) debe estar levantado
 * a mano en :5090 antes de correr `pnpm e2e` — este config solo levanta el
 * frontend automáticamente.
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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
