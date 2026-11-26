import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { AuthSessionService } from '@core/services/auth-session.service';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/utils/auth-token.storage';

import { MainLayout } from './main-layout';

/** Página vacía para las rutas de prueba. */
@Component({ template: '' })
class BlankPage {}

describe('MainLayout', () => {
  let fixture: ComponentFixture<MainLayout>;
  let root: HTMLElement;

  function signIn(roles: string[]): void {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 1,
      personId: 1,
      username: 'ana.laura',
      email: 'ana.laura@example.test',
      roles,
      displayName: 'ana.laura',
    });
  }

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(MainLayout);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  }

  function menuButton(): HTMLButtonElement {
    return root.querySelector<HTMLButtonElement>('[data-testid="mobile-menu-button"] button')!;
  }

  function menuPanel(): HTMLElement {
    return root.querySelector<HTMLElement>('[data-testid="mobile-menu"]')!;
  }

  function linkLabels(testId: string): string[] {
    return Array.from(root.querySelectorAll(`[data-testid="${testId}"]`)).map((el) => el.textContent?.trim() ?? '');
  }

  async function openMenu(): Promise<void> {
    menuButton().click();
    await fixture.whenStable();
  }

  beforeEach(() => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    globalThis.localStorage?.removeItem(AUTH_TOKEN_STORAGE_KEY);
    TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([{ path: '**', component: BlankPage }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    globalThis.localStorage?.removeItem(AUTH_TOKEN_STORAGE_KEY);
  });

  it('no muestra el botón Menú sin sesión', async () => {
    await render();

    expect(root.querySelector('[data-testid="mobile-menu-button"]')).toBeNull();
    expect(menuPanel()).toBeNull();
  });

  it('el botón Menú alterna aria-expanded y la visibilidad del panel', async () => {
    signIn(['BRANCH_COMMISSIONER']);
    await render();

    const button = menuButton();
    expect(button.textContent).toContain('Menú');
    expect(button.getAttribute('aria-controls')).toBe(menuPanel().id);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menuPanel().hidden).toBe(true);

    await openMenu();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menuPanel().hidden).toBe(false);

    await openMenu();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menuPanel().hidden).toBe(true);
  });

  it('Escape cierra el menú y devuelve el foco al botón', async () => {
    signIn(['BRANCH_COMMISSIONER']);
    await render();
    await openMenu();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menuButton());
  });

  it('se cierra al navegar', async () => {
    signIn(['BRANCH_COMMISSIONER']);
    await render();
    await openMenu();

    await TestBed.inject(Router).navigateByUrl('/calendario');
    await fixture.whenStable();

    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(menuPanel().hidden).toBe(true);
  });

  it('se cierra al pulsar un enlace del menú', async () => {
    signIn(['ADMIN']);
    await render();
    await openMenu();

    root.querySelector<HTMLAnchorElement>('[data-testid="mobile-menu-link"]')!.click();
    await fixture.whenStable();

    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('en el menú móvil, los enlaces principales van antes que los de funcionalidades', async () => {
    signIn(['ADMIN']);
    await render();

    expect(linkLabels('mobile-menu-primary-link')).toEqual(['Calendario', 'Inicio']);
    expect(menuPanel().textContent?.indexOf('Calendario')).toBeLessThan(
      menuPanel().textContent?.indexOf('Módulos de formación') ?? -1,
    );
  });

  it('con sesión, la navegación principal del encabezado se oculta en móvil para no partirlo en dos líneas', async () => {
    signIn(['BRANCH_COMMISSIONER']);
    await render();

    const headerNav = root.querySelector('header > div nav[aria-label="Principal"]')!;
    expect(headerNav.classList).toContain('hidden');
    expect(headerNav.classList).toContain('md:flex');
  });

  it('sin roles de gestión no muestra enlaces de funcionalidades ni sidebar', async () => {
    signIn(['BRANCH_COMMISSIONER']);
    await render();

    expect(linkLabels('mobile-menu-link')).toEqual([]);
    expect(linkLabels('sidebar-link')).toEqual([]);
    expect(root.querySelector('aside')).toBeNull();
  });

  it('la secretaría ve los enlaces de gestión, iguales en menú y sidebar', async () => {
    signIn(['DISTRICT_SECRETARY']);
    await render();

    const expected = [
      'Inscripción a módulos de formación',
      'Módulos de formación',
      'Requisitos de formación',
    ];
    expect(linkLabels('mobile-menu-link')).toEqual(expected);
    expect(linkLabels('sidebar-link')).toEqual(expected);
  });

  it('el administrador ve el catálogo pero no inscripciones ni requisitos', async () => {
    signIn(['ADMIN']);
    await render();

    expect(linkLabels('mobile-menu-link')).toEqual(['Módulos de formación']);
  });

  it('marca el enlace activo por color y con aria-current', async () => {
    signIn(['ADMIN']);
    await TestBed.inject(Router).navigateByUrl('/admin/modulos');
    await render();

    const link = root.querySelector<HTMLAnchorElement>('[data-testid="mobile-menu-link"]')!;
    expect(link.classList).toContain('text-dsc-dark');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.textContent).not.toContain('Seleccionado');
  });
});
