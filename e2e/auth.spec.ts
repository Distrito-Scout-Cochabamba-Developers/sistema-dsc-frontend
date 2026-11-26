import { expect, test } from '@playwright/test';

test('muestra la pantalla de login a pantalla completa', async ({ page }) => {
  await page.goto('/auth/login');

  await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
  await expect(page.getByLabel('Usuario o correo')).toBeVisible();
  await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '¿Olvidé mi contraseña?' })).toBeDisabled();
});
