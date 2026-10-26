import { expect, test } from '@playwright/test';

test('muestra la pantalla de login a pantalla completa', async ({ page }) => {
  await page.goto('/auth/login');

  await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
  await expect(page.getByLabel('Correo electrónico')).toBeVisible();
  await expect(page.getByLabel('Contraseña')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Google' })).toBeDisabled();
});
