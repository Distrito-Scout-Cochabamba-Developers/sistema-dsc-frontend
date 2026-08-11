import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthSessionService } from '@core/services/auth-session.service';

import { AsistenciaPage } from './asistencia-page';

const SESSION_ID = 'mod-liderazgo-20241024';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createComponent(sessionId: string) {
  const fixture = TestBed.createComponent(AsistenciaPage);
  fixture.componentRef.setInput('sessionId', sessionId);
  fixture.detectChanges();
  return fixture;
}

function textOf(fixture: ReturnType<typeof createComponent>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function setInputValue(
  fixture: ReturnType<typeof createComponent>,
  selector: string,
  value: string,
): void {
  const el = fixture.nativeElement.querySelector(selector) as HTMLInputElement | HTMLSelectElement;
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

describe('AsistenciaPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('debe crearse', () => {
    const fixture = createComponent(SESSION_ID);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra "Sesión no válida" cuando el sessionId no existe en el mock', async () => {
    const fixture = createComponent('sesion-inexistente');
    await wait(200);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Sesión no válida');
  });

  it('muestra el formulario con los datos de la sesión cuando el sessionId es válido', async () => {
    const fixture = createComponent(SESSION_ID);
    await wait(200);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Módulo de Liderazgo y Servicio');
    expect(fixture.nativeElement.querySelector('#ci')).toBeTruthy();
  });

  it('precompleta el formulario si el dirigente ya está autenticado', async () => {
    const fixture = createComponent(SESSION_ID);
    await wait(200);
    fixture.detectChanges();

    const ciInput = fixture.nativeElement.querySelector('#ci') as HTMLInputElement;
    expect(ciInput.value).toBe('12345678');
    expect(textOf(fixture)).toContain('Has iniciado sesión como');
  });

  it('autocompleta nombre y extensión al ingresar un CI existente en el directorio (sin sesión activa)', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(200);
    fixture.detectChanges();

    setInputValue(fixture, '#ci', '87654321');
    fixture.detectChanges();
    await wait(900); // debounce (400ms) + delay del lookup mock (450ms)
    fixture.detectChanges();

    const nameInput = fixture.nativeElement.querySelector('#fullName') as HTMLInputElement;
    expect(nameInput.value).toBe('María López Quispe');
    expect(textOf(fixture)).toContain('Perfil encontrado');
  });

  it('ofrece registro parcial cuando el CI no existe en el directorio', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(200);
    fixture.detectChanges();

    setInputValue(fixture, '#ci', '99999999');
    fixture.detectChanges();
    await wait(900);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('registro parcial');
  });

  it('valida que el CI debe ser numérico', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(200);
    fixture.detectChanges();

    const ciInput = fixture.nativeElement.querySelector('#ci') as HTMLInputElement;
    setInputValue(fixture, '#ci', 'abc123');
    ciInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await wait(50);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Ingresa un CI numérico válido');
  });

  it('valida que el teléfono debe tener 8 dígitos', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(200);
    fixture.detectChanges();

    const phoneInput = fixture.nativeElement.querySelector('#phone') as HTMLInputElement;
    setInputValue(fixture, '#phone', '123');
    phoneInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await wait(50);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Ingresa un móvil de 8 dígitos');
  });

  it('completa el flujo de registro parcial y muestra la pantalla de éxito', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(200);
    fixture.detectChanges();

    setInputValue(fixture, '#ci', '11112222');
    fixture.detectChanges();
    await wait(900); // deja resolver el lookup (CI no encontrado)
    fixture.detectChanges();

    setInputValue(fixture, '#fullName', 'Test Persona');
    setInputValue(fixture, '#extension', 'LP');
    setInputValue(fixture, '#phone', '70011122');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await wait(800); // delay del registro mock (600ms)
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Registro exitoso');
    expect(text).toContain('Test Persona');
    expect(text).toContain('Registro parcial');
  });
});
