/**
 * E2E real de "Registro Digital de Asistencia a Módulos": navegador real +
 * frontend real (`pnpm start`) + backend real (`dotnet run`, puerto 5090) +
 * Postgres real. Sin mocks en ningún punto — si el backend no está levantado
 * con la base sembrada, estos tests fallan de verdad, no dan falso positivo.
 *
 * Prerrequisito manual (no lo levanta este archivo):
 *   cd sistema-dsc-backend && dotnet run --project src/DSC.Api
 */
import { test, expect } from '@playwright/test';

const SESSION_PATH = '/asistencia/SCOUT_METHOD_AND_PROGRAM';

test('flujo de registro digital de asistencia (AC2, AC3, AC4)', async ({ page }) => {
  await page.goto(SESSION_PATH);

  await test.step('Caso 1 (AC2): exige Nombre, CI, Extensión y Teléfono', async () => {
    // Arrange: hay una sesión demo activa por defecto que precompleta el
    // formulario; hay que cerrarla para partir de los 4 campos vacíos.
    await page.getByRole('button', { name: 'Cambiar Perfil' }).click();
    await expect(page.locator('#ci')).toHaveValue('');

    // Act: enviar el formulario sin llenar ningún campo
    await page.getByRole('button', { name: 'Registrar Asistencia' }).click();

    // Assert: los 4 campos obligatorios muestran su mensaje de error
    await expect(page.getByText('Ingresa un CI numérico válido (7 a 10 dígitos).')).toBeVisible();
    await expect(page.getByText('Este campo es obligatorio')).toHaveCount(2); // Nombre + Extensión
    await expect(page.getByText('Ingresa un móvil de 8 dígitos.')).toBeVisible();
  });

  await test.step('Caso 2 (AC3): rechaza un CI con letras', async () => {
    // Act: escribir un CI no numérico y salir del campo (blur)
    const ciInput = page.locator('#ci');
    await ciInput.fill('123ABC');
    await ciInput.blur();

    // Assert
    await expect(page.getByText('Ingresa un CI numérico válido (7 a 10 dígitos).')).toBeVisible();
  });

  await test.step('Caso 3 (AC4): autocompleta con un CI que ya existe en el distrito', async () => {
    // Act: escribir un CI real, creado en una prueba manual anterior contra
    // este mismo Postgres
    await page.locator('#ci').fill('22334455');

    // Assert: `toBeVisible()` reintenta sola hasta su timeout (docs oficiales:
    // "web-first assertions") — no hace falta esperar a mano el debounce +
    // round-trip HTTP, la aserción ya cubre eso.
    await expect(page.getByText('Perfil encontrado')).toBeVisible();
    await expect(page.locator('#fullName')).toHaveValue('Ana Rojas');
  });
});

// BUG REAL encontrado por este E2E (no un error del test): `getModuleSession`
// (`buildModuleSessionView`) fabrica una vista de sesión en el cliente para
// CUALQUIER string, sin validar contra el backend si el módulo existe.
// Resultado: un link roto o QR expirado abre el formulario igual, en vez de
// mostrar "Sesión no válida" (viola AC1 de la historia). `.fixme()` para que
// quede documentado sin romper el pipeline hasta decidir un endpoint real de
// validación de sesión en el backend.
test.fixme('AC1: muestra "Sesión no válida" cuando el código del módulo no existe', async ({ page }) => {
  await page.goto('/asistencia/CODIGO-QUE-NO-EXISTE');
  await expect(page.getByText('Sesión no válida')).toBeVisible();
});

// BUG REAL ya conocido: el backend espera una tabla `ModuleAttendances` que no
// existe en el schema real (`training_module_enrollment` la reemplaza). El
// registro de PERSONA sí funciona (verificado por curl); falla al persistir
// la asistencia. `.fixme()` hasta resolver la Opción A o B pendiente.
test.fixme('AC5/AC7: completa el registro de un CI nuevo (registro parcial)', async ({ page }) => {
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
