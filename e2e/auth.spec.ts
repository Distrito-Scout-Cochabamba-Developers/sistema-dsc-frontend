import { test } from '@playwright/test';

// El work item "Autenticación" no tiene criterios de aceptación definidos
// todavía. Lo único que existe hoy es una sesión simulada hardcodeada
// (auth-session.service.ts) — no hay pantalla de login, ni endpoint de
// backend, ni validación real. Pendiente de que el equipo defina el flujo
// (CI + contraseña, SSO, etc.) antes de poder escribir el caso real.
test.fixme('existe un flujo de login real (pendiente de criterios de aceptación)', async () => {});
