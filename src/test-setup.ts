/**
 * Setup de pruebas unitarias (Vitest + jsdom).
 * Node >= 25 define `localStorage`/`sessionStorage` globales sin almacenamiento configurado (Web Storage
 * nativo), que ocultan los de jsdom y valen `undefined`. Se reponen los de jsdom para que las pruebas
 * no dependan de la versión de Node.
 */
const jsdomWindow = (globalThis as { jsdom?: { window: Window } }).jsdom?.window;
if (jsdomWindow) {
  for (const key of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(globalThis, key, { configurable: true, value: jsdomWindow[key] });
  }
}
