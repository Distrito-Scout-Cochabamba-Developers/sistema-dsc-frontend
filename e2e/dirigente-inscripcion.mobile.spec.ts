/**
 * E2E móvil (perfil `mobile-chromium`, Pixel 7) del flujo del dirigente:
 * encontrar una programación de un módulo de formación, inscribirse y
 * reconocer la confirmación. Real: navegador + frontend + backend + Postgres.
 *
 * Prerrequisitos:
 * - Backend en :5090 con al menos una programación abierta y futura.
 * - Para la inscripción con sesión iniciada, una cuenta de dirigente de los
 *   usuarios de desarrollo (`sistema-dsc-backend/docs/auth-login.md`):
 *     $env:E2E_DIRIGENTE_IDENTIFIER = "<usuario o correo>"
 *     $env:E2E_DIRIGENTE_PASSWORD = "<contraseña-local>"
 *   Sin estas variables esa prueba se omite. La prueba crea una inscripción
 *   real en la programación elegida.
 *
 * Ejecutar: pnpm exec playwright test --project=mobile-chromium --reporter=line
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

// Sin depender de @types/node (no está en devDependencies): Playwright corre en Node.
const env =
  (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
const IDENTIFIER = env['E2E_DIRIGENTE_IDENTIFIER'];
const PASSWORD = env['E2E_DIRIGENTE_PASSWORD'];

/** Falla si la página genera scroll horizontal en el viewport móvil. */
async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, 'la página no debe desbordar el ancho del viewport').toBeLessThanOrEqual(0);
}

/** Falla si el elemento se sale horizontalmente del viewport. */
async function expectInsideViewportWidth(page: Page, locator: Locator): Promise<void> {
  const box = await locator.boundingBox();
  const width = page.viewportSize()?.width ?? 0;
  expect(box, 'el elemento debe tener caja visible').not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(width);
}

/** Primera tarjeta de programación con la acción «Inscribirme». */
function firstEnrollableProgramacion(page: Page): Locator {
  return page
    .getByRole('main')
    .getByRole('listitem')
    .filter({ has: page.getByRole('button', { name: 'Inscribirme' }) })
    .first();
}

test.describe('Dirigente en móvil: inscripción a una programación de un módulo de formación', () => {
  test('sin sesión, encuentra una programación y la inscripción le pide iniciar sesión', async ({
    page,
  }) => {
    await page.goto('/');

    await test.step('llega al calendario de programaciones desde la navegación principal', async () => {
      await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Calendario' }).click();
      await expect(page.getByRole('heading', { name: 'Calendario de módulos', level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });

    const programacion = firstEnrollableProgramacion(page);

    await test.step('encuentra una programación con cupo para inscribirse', async () => {
      await expect(programacion).toBeVisible();
      // En móvil la vista por defecto es Lista: la primera acción no exige recorrer el mes.
      await expect(page.getByRole('button', { name: 'Lista' })).toHaveAttribute('aria-pressed', 'true');
      await expect(programacion.getByRole('button', { name: 'Inscribirme' })).toBeInViewport();
      await programacion.getByRole('button', { name: 'Inscribirme' }).click();
    });

    await test.step('el diálogo de inscripción cabe en pantalla y ofrece iniciar sesión', async () => {
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', { name: 'Confirmar inscripción' })).toBeVisible();
      await expect(dialog.getByText('inicia sesión con tu cuenta de dirigente')).toBeVisible();
      const login = dialog.getByRole('button', { name: 'Iniciar sesión' });
      await expect(login).toBeInViewport();
      await expectInsideViewportWidth(page, dialog);

      await login.click();
      await expect(page).toHaveURL(/\/auth\/login\?returnUrl=%2Fcalendario/);
    });
  });

  test('con sesión de dirigente, abre el menú, se inscribe y reconoce la confirmación', async ({
    page,
  }) => {
    test.skip(
      !IDENTIFIER || !PASSWORD,
      'Define E2E_DIRIGENTE_IDENTIFIER y E2E_DIRIGENTE_PASSWORD (usuario de desarrollo autorizado).',
    );

    await test.step('inicia sesión', async () => {
      await page.goto('/auth/login?returnUrl=%2F');
      await page.getByLabel('Usuario o correo').fill(IDENTIFIER!);
      await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD!);
      await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    });

    await test.step('el encabezado cabe en una línea', async () => {
      const header = await page.locator('header').boundingBox();
      expect(header!.height, 'el encabezado con sesión no debe partirse en dos líneas').toBeLessThan(90);
    });

    await test.step('abre el menú y va directo al calendario; el menú se cierra al navegar', async () => {
      const menuButton = page.getByRole('button', { name: 'Menú' });
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      const menu = page.locator('#menu-movil');
      await expect(menu).toBeVisible();
      await menu.getByRole('link', { name: 'Calendario', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Calendario de módulos', level: 1 })).toBeVisible();
      await expect(menu).toBeHidden();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await expectNoHorizontalOverflow(page);
    });

    const programacion = firstEnrollableProgramacion(page);
    let moduleName = '';

    await test.step('elige una programación y confirma la inscripción', async () => {
      await expect(programacion).toBeVisible();
      moduleName = (await programacion.getByRole('heading', { level: 3 }).innerText()).trim();
      await programacion.getByRole('button', { name: 'Inscribirme' }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', { name: 'Confirmar inscripción' })).toBeVisible();
      const confirm = dialog.getByRole('button', { name: 'Confirmar inscripción' });
      await expect(confirm).toBeInViewport();
      await expectInsideViewportWidth(page, dialog);
      await confirm.click();
      await expect(dialog).toBeHidden();
    });

    await test.step('reconoce la confirmación en la tarjeta de la programación', async () => {
      const inscrita = page
        .getByRole('main')
        .getByRole('listitem')
        .filter({ has: page.getByRole('heading', { name: moduleName, level: 3 }) })
        .filter({ hasText: 'Ya estás inscrito' })
        .first();
      await expect(inscrita).toBeVisible();
      // Confirmación anunciada (role="status") y visible sin desplazarse.
      const aviso = page.getByRole('status').filter({ hasText: 'Inscripción confirmada' });
      await expect(aviso).toContainText(moduleName);
      await expect(aviso).toBeInViewport();
    });
  });
});
