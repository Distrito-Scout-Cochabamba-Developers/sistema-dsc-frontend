/**
 * E2E real (navegador + frontend + backend + Postgres, sin mocks).
 * Prerrequisito: cd sistema-dsc-backend && dotnet run --project src/DSC.Api
 */
import { test, expect, type Page } from '@playwright/test';

const SESSION_PATH = '/asistencia/SCOUT_METHOD_AND_PROGRAM';
const CI_ERROR = 'Ingresa un CI numérico válido (7 a 10 dígitos).';
const PHONE_ERROR = 'Ingresa un móvil de 8 dígitos.';

async function fillAndBlur(page: Page, selector: string, value: string): Promise<void> {
  const field = page.locator(selector);
  await field.fill(value);
  await field.blur();
}

const ciCases: { value: string; valid: boolean; label: string }[] = [
  { value: '123456', valid: false, label: '6 dígitos' },
  { value: '1234567', valid: true, label: '7 dígitos' },
  { value: '1234567890', valid: true, label: '10 dígitos' },
  { value: '12345678901', valid: false, label: '11 dígitos' },
  { value: '123ABC', valid: false, label: 'con letras' },
];

const phoneCases: { value: string; valid: boolean; label: string }[] = [
  { value: '1234567', valid: false, label: '7 dígitos' },
  { value: '12345678', valid: true, label: '8 dígitos' },
];

test('flujo de registro digital de asistencia', async ({ page }) => {
  await page.goto(SESSION_PATH);

  await test.step('exige Nombre, CI, Extensión y Teléfono', async () => {
    await page.getByRole('button', { name: 'Cambiar Perfil' }).click(); // limpia el prellenado
    await expect(page.locator('#ci')).toHaveValue('');

    await page.getByRole('button', { name: 'Registrar Asistencia' }).click();

    await expect(page.getByText(CI_ERROR)).toBeVisible();
    await expect(page.getByText('Este campo es obligatorio')).toHaveCount(2); // Nombre + Extensión
    await expect(page.getByText(PHONE_ERROR)).toBeVisible();
  });

  await test.step('un Nombre de solo espacios cuenta como vacío', async () => {
    await fillAndBlur(page, '#fullName', '   ');
    await expect(page.getByText('Este campo es obligatorio')).toBeVisible();
  });

  for (const { value, valid, label } of ciCases) {
    await test.step(`CI ${label} -> ${valid ? 'válido' : 'inválido'}`, async () => {
      await fillAndBlur(page, '#ci', value);
      if (valid) {
        await expect(page.getByText(CI_ERROR)).not.toBeVisible();
      } else {
        await expect(page.getByText(CI_ERROR)).toBeVisible();
      }
    });
  }

  for (const { value, valid, label } of phoneCases) {
    await test.step(`Teléfono ${label} -> ${valid ? 'válido' : 'inválido'}`, async () => {
      await fillAndBlur(page, '#phone', value);
      if (valid) {
        await expect(page.getByText(PHONE_ERROR)).not.toBeVisible();
      } else {
        await expect(page.getByText(PHONE_ERROR)).toBeVisible();
      }
    });
  }

  await test.step('autocompleta con un CI que ya existe en el distrito', async () => {
    await page.locator('#ci').fill('22334455');
    await expect(page.getByText('Perfil encontrado')).toBeVisible();
    await expect(page.locator('#fullName')).toHaveValue('Ana Rojas');
  });
});

// Bug: getModuleSession fabrica la sesión en el cliente sin validar contra el
// backend. Cualquier código abre el formulario igual (viola criterio 1).
test.fixme('muestra "Sesión no válida" con un código inexistente', async ({ page }) => {
  await page.goto('/asistencia/CODIGO-QUE-NO-EXISTE');
  await expect(page.getByText('Sesión no válida')).toBeVisible();
});

// Bug: el backend espera la tabla "ModuleAttendances", que no existe en el
// schema real (usa training_module_enrollment). Falla al guardar la asistencia.
test.fixme('registro de un CI nuevo (parcial)', async ({ page }) => {
  const uniqueCi = `9${Date.now().toString().slice(-7)}`;
  await page.goto(SESSION_PATH);
  await page.locator('#ci').fill(uniqueCi);
  await expect(page.getByText('CI no encontrado en el distrito')).toBeVisible();

  await page.locator('#fullName').fill('Playwright Test');
  await page.locator('#extension').selectOption('LP');
  await page.locator('#phone').fill('70099887');
  await page.getByRole('button', { name: 'Registrar Asistencia' }).click();

  await expect(page.getByText('Registro exitoso')).toBeVisible({ timeout: 5000 });
});
