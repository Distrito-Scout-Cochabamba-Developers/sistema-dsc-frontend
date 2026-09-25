import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { KardexDetailPage } from './pages/kardex-detail-page';
import { KARDEX_ROUTES } from './kardex.routes';

describe('KARDEX_ROUTES', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLocationMocks(),
        provideRouter([{ path: 'kardex', children: KARDEX_ROUTES }], withComponentInputBinding()),
      ],
    });
  });

  it('deep-links to a leader detail while keeping the mock provider active', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/kardex/leader-carlos-mendoza', KardexDetailPage);

    expect(harness.routeNativeElement?.textContent).toContain('Carlos Mendoza');
    expect(harness.routeNativeElement?.textContent).toContain('Módulo Avanzado de Liderazgo');
  });
});
