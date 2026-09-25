import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DscNavbar } from './dsc-navbar';

describe('DscNavbar', () => {
  it('keeps Kardex discoverable in the mobile navigation', async () => {
    await TestBed.configureTestingModule({
      imports: [DscNavbar],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(DscNavbar);
    fixture.detectChanges();

    const mobileNavigation = fixture.nativeElement.querySelector(
      '[data-testid="mobile-navigation"]',
    ) as HTMLElement;
    const kardexLink = mobileNavigation.querySelector('a[href="/kardex"]');

    expect(mobileNavigation).toBeTruthy();
    expect(kardexLink?.textContent).toContain('Kardex');
  });
});
