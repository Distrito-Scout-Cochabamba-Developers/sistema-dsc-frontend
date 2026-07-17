/**
 * Punto de entrada del navegador.
 * Arranca la aplicación standalone con la configuración de `app.config.ts`.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err: unknown) => {
  console.error(err);
});
