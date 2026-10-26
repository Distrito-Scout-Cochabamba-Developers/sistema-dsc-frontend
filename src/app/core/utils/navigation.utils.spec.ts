import { safeInternalUrl } from './navigation.utils';

describe('safeInternalUrl', () => {
  it('acepta rutas relativas de la app', () => {
    expect(safeInternalUrl('/asistencia/abc')).toBe('/asistencia/abc');
  });

  it('rechaza open-redirects', () => {
    expect(safeInternalUrl('https://evil.example')).toBe('/');
    expect(safeInternalUrl('//evil.example')).toBe('/');
    expect(safeInternalUrl(null)).toBe('/');
  });
});
