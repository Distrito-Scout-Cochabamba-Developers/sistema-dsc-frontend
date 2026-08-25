/**
 * Estado local (en memoria) de módulos y participantes para la Secretaría.
 * Sin `HttpClient` todavía — simula la futura API con signals, para validar
 * la UI antes de definir el contrato real.
 */
import { Injectable, Signal, computed, signal } from '@angular/core';

import type {
  ModuleEvent,
  NewParticipantInput,
  ParticipantRecord,
} from '@core/models/module-management.models';

const SAMPLE_MODULES: ModuleEvent[] = [
  {
    id: 'mod-001',
    moduleTitle: 'Método y Programa de Jóvenes',
    moduleCode: 'SCOUT_METHOD_AND_PROGRAM',
    dateLabel: '12 sep. 2026',
    participantsCount: 2,
    isRegistrationOpen: true,
  },
  {
    id: 'mod-002',
    moduleTitle: 'Administración de Grupo',
    moduleCode: 'GROUP_ADMINISTRATION',
    dateLabel: '19 sep. 2026',
    participantsCount: 1,
    isRegistrationOpen: true,
  },
  {
    id: 'mod-003',
    moduleTitle: 'Fundamentos del Escultismo',
    moduleCode: 'SCOUTING_FUNDAMENTALS',
    dateLabel: '3 ago. 2026',
    participantsCount: 0,
    isRegistrationOpen: false,
  },
];

const SAMPLE_PARTICIPANTS: Record<string, ParticipantRecord[]> = {
  'mod-001': [
    { enrollmentId: 'enr-001', ci: '22334455', fullName: 'Ana Rojas', phone: '70011223', attended: true },
    { enrollmentId: 'enr-002', ci: '12345678', fullName: 'Dir. Juan Pérez', phone: '70000000', attended: false },
  ],
  'mod-002': [
    { enrollmentId: 'enr-003', ci: '99887766', fullName: 'Marco Vino', phone: '77788899', attended: true },
  ],
  'mod-003': [],
};

/**
 * Fuente de verdad en memoria de módulos-evento y sus participantes para la
 * feature de gestión de la Secretaría (singleton, `core` de la feature).
 *
 * @remarks
 * Sin `HttpClient` todavía (AD-1 de la arquitectura de esta feature): los
 * métodos ya tienen la firma que tendrá la futura API, pero conectarla
 * requerirá además convertir cada consumidor de lectura síncrona a un
 * `resource`/observable con sus propios estados de carga y error.
 */
@Injectable({ providedIn: 'root' })
export class ModuleManagementService {
  private readonly moduleEvents = signal<ModuleEvent[]>(SAMPLE_MODULES);
  private readonly participants = signal<Record<string, ParticipantRecord[]>>(SAMPLE_PARTICIPANTS);

  /**
   * Módulos-evento que coinciden con el texto de búsqueda (criterio 1).
   *
   * @param query - Signal con el texto de búsqueda actual (nombre o código).
   * @returns Signal derivado con los módulos filtrados.
   */
  searchModules(query: Signal<string>): Signal<ModuleEvent[]> {
    return computed(() => {
      const term = query().trim().toLowerCase();
      const modules = this.moduleEvents();
      if (!term) {
        return modules;
      }
      return modules.filter(
        (m) => m.moduleTitle.toLowerCase().includes(term) || m.moduleCode.toLowerCase().includes(term),
      );
    });
  }

  /**
   * Busca un módulo-evento por id.
   *
   * @param id - Identificador del módulo-evento.
   * @returns El módulo si existe, o `undefined`.
   */
  getModule(id: string): ModuleEvent | undefined {
    return this.moduleEvents().find((m) => m.id === id);
  }

  /**
   * Participantes registrados en un módulo-evento.
   *
   * @param moduleId - Identificador del módulo-evento.
   * @returns Signal derivado con la lista de participantes (vacía si no hay).
   */
  listParticipants(moduleId: string): Signal<ParticipantRecord[]> {
    return computed(() => this.participants()[moduleId] ?? []);
  }

  /**
   * Busca un dirigente ya registrado en cualquier módulo, por CI.
   *
   * @param ci - CI a buscar.
   * @returns El registro encontrado, o `undefined` si el CI no existe todavía.
   */
  findByCi(ci: string): ParticipantRecord | undefined {
    const trimmed = ci.trim();
    for (const list of Object.values(this.participants())) {
      const found = list.find((p) => p.ci === trimmed);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  /**
   * Busca un participante por CI dentro de un módulo específico.
   *
   * @param moduleId - Módulo-evento donde buscar.
   * @param ci - CI a buscar (se compara ya con `trim()`).
   * @returns El registro encontrado en ese módulo, o `undefined`.
   */
  findByCiInModule(moduleId: string, ci: string): ParticipantRecord | undefined {
    const trimmed = ci.trim();
    return (this.participants()[moduleId] ?? []).find((p) => p.ci === trimmed);
  }

  /**
   * Añade un participante al módulo; crea su perfil si el CI no existía (criterio 2).
   * Si el CI ya está enrolado en este mismo módulo, actualiza ese registro en
   * vez de crear uno duplicado (NFR-03).
   *
   * @param moduleId - Módulo-evento al que se añade el participante.
   * @param input - Datos ingresados en el formulario de alta manual.
   */
  addParticipant(moduleId: string, input: NewParticipantInput): void {
    const ci = input.ci.trim();
    const fullName = input.fullName.trim();
    const phone = input.phone.trim();
    const existingInModule = this.findByCiInModule(moduleId, ci);

    if (existingInModule) {
      this.updateParticipant(moduleId, existingInModule.enrollmentId, { fullName, phone });
      return;
    }

    const enrollmentId = `enr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: ParticipantRecord = { enrollmentId, ci, fullName, phone, attended: true };
    this.participants.update((current) => ({
      ...current,
      [moduleId]: [...(current[moduleId] ?? []), record],
    }));
    this.moduleEvents.update((modules) =>
      modules.map((m) => (m.id === moduleId ? { ...m, participantsCount: m.participantsCount + 1 } : m)),
    );
  }

  /**
   * Corrige un registro existente (criterio 3).
   *
   * @param moduleId - Módulo-evento donde vive el registro.
   * @param enrollmentId - Identificador del registro a corregir.
   * @param changes - Campos a actualizar.
   */
  updateParticipant(moduleId: string, enrollmentId: string, changes: Partial<ParticipantRecord>): void {
    this.participants.update((current) => ({
      ...current,
      [moduleId]: (current[moduleId] ?? []).map((p) =>
        p.enrollmentId === enrollmentId ? { ...p, ...changes } : p,
      ),
    }));
  }
}
