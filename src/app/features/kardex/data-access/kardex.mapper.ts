import type {
  LeaderAccent,
  LeaderDetail,
  LeaderFilterOptions,
  LeaderSummary,
  LeaderTrainingLevel,
  LeaderTrainingModule,
  LeaderTrainingStatus,
} from '../models/kardex.models';

const TRAINING_LEVELS: readonly LeaderTrainingLevel[] = ['IM I-II', 'IM III', 'Sin registro'];

const MODULE_STATUS_LABELS: Readonly<Record<LeaderTrainingStatus, string>> = {
  completed: 'Completado',
  enrolled: 'Inscrito',
  pending: 'Pendiente',
};

/** Error de validación para respuestas incompatibles con el contrato Kardex. */
export class KardexDataError extends Error {
  constructor(message = 'La respuesta de Kardex no cumple el contrato esperado.') {
    super(message);
    this.name = 'KardexDataError';
  }
}

/**
 * Convierte un DTO desconocido del directorio en un modelo de presentación seguro.
 *
 * @param value - Valor recibido desde el límite de transporte.
 * @returns Tarjeta validada con iniciales y color derivados localmente.
 * @throws {KardexDataError} Si faltan campos o hay valores fuera del contrato.
 */
export function mapLeaderSummaryDto(value: unknown): LeaderSummary {
  const dto = requireRecord(value);
  const fullName = requireString(dto, 'fullName');
  const ci = requireString(dto, 'ci');
  const rawId = dto['id'];
  if (typeof rawId !== 'string') {
    throw new KardexDataError();
  }
  const id = requireOpaqueLeaderId(rawId);
  const trainingLevel = requireTrainingLevel(dto['trainingLevel']);

  if (normalizeIdentifier(id).includes(normalizeIdentifier(ci))) {
    throw new KardexDataError('El identificador opaco no puede contener el CI.');
  }

  return {
    id,
    fullName,
    ci,
    role: requireString(dto, 'role'),
    scoutGroup: requireString(dto, 'scoutGroup'),
    branch: requireString(dto, 'branch'),
    trainingLevel,
    avatarUrl: safeImageUrl(requireNullableString(dto, 'avatarUrl')),
    accent: accentFor(trainingLevel),
    initials: initialsFor(fullName),
  };
}

/**
 * Convierte un DTO desconocido en la ficha digital validada.
 *
 * @param value - Valor recibido desde el límite de transporte.
 * @returns Ficha con módulos y etiquetas de estado controladas por frontend.
 * @throws {KardexDataError} Si el contrato de la respuesta es inválido.
 */
export function mapLeaderDetailDto(value: unknown): LeaderDetail {
  const dto = requireRecord(value);
  const summary = mapLeaderSummaryDto(dto);
  const modules = dto['trainingModules'];
  if (!Array.isArray(modules)) {
    throw new KardexDataError();
  }

  const trainingModules = modules.map(mapTrainingModuleDto);
  assertUniqueIds(trainingModules);

  return {
    ...summary,
    email: requireNullableString(dto, 'email'),
    phone: requireNullableString(dto, 'phone'),
    district: requireString(dto, 'district'),
    joinedAt: requireNullableString(dto, 'joinedAt'),
    trainingModules,
  };
}

/**
 * Valida y transforma una colección del endpoint de directorio.
 *
 * @param value - Respuesta desconocida del backend.
 * @returns Lista de dirigentes con identificadores únicos.
 * @throws {KardexDataError} Si la colección o alguno de sus elementos es inválido.
 */
export function mapLeaderSummaryListDto(value: unknown): readonly LeaderSummary[] {
  const leaders = requireArray(value).map(mapLeaderSummaryDto);
  assertUniqueIds(leaders);
  return leaders;
}

/**
 * Valida la respuesta de catálogos del backend.
 *
 * @param value - Respuesta desconocida del endpoint de filtros.
 * @returns Catálogos tipados para la UI.
 * @throws {KardexDataError} Si algún catálogo tiene una forma inválida.
 */
export function mapLeaderFilterOptionsDto(value: unknown): LeaderFilterOptions {
  const dto = requireRecord(value);
  return {
    scoutGroups: unique(requireStringArray(dto['scoutGroups'])),
    branches: unique(requireStringArray(dto['branches'])),
    trainingLevels: unique(requireArray(dto['trainingLevels']).map(requireTrainingLevel)),
  };
}

/**
 * Valida un identificador de ruta como segmento opaco y no sensible.
 *
 * @param value - Identificador recibido desde la ruta o el transporte.
 * @returns Identificador listo para ser codificado como un único segmento.
 * @throws {KardexDataError} Si contiene separadores, espacios o segmentos de punto.
 */
export function requireOpaqueLeaderId(value: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value) || value === '.' || value === '..') {
    throw new KardexDataError('El identificador de dirigente no es válido.');
  }
  return value;
}

function mapTrainingModuleDto(value: unknown): LeaderTrainingModule {
  const dto = requireRecord(value);
  const status = requireTrainingStatus(dto['status']);
  return {
    id: requireString(dto, 'id'),
    name: requireString(dto, 'name'),
    description: optionalString(dto, 'description') ?? 'Descripción no registrada.',
    status,
    statusLabel: MODULE_STATUS_LABELS[status],
    completedAt: optionalString(dto, 'completedAt'),
  };
}

function requireRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new KardexDataError();
  }
  return value as Record<string, unknown>;
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new KardexDataError();
  }
  return value.trim();
}

function requireNullableString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new KardexDataError();
  }
  return value.trim() || null;
}

function optionalString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new KardexDataError();
  }
  return value.trim() || null;
}

function requireArray(value: unknown): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new KardexDataError();
  }
  return value;
}

function requireStringArray(value: unknown): readonly string[] {
  return requireArray(value).map((item) => {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw new KardexDataError();
    }
    return item.trim();
  });
}

function unique<T>(items: readonly T[]): readonly T[] {
  return [...new Set(items)];
}

function assertUniqueIds(items: readonly { readonly id: string }[]): void {
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new KardexDataError('La respuesta contiene identificadores duplicados.');
  }
}

function normalizeIdentifier(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').toLocaleLowerCase('es-BO');
}

function requireTrainingLevel(value: unknown): LeaderTrainingLevel {
  if (typeof value !== 'string' || !TRAINING_LEVELS.includes(value as LeaderTrainingLevel)) {
    throw new KardexDataError();
  }
  return value as LeaderTrainingLevel;
}

function requireTrainingStatus(value: unknown): LeaderTrainingStatus {
  if (value !== 'completed' && value !== 'enrolled' && value !== 'pending') {
    throw new KardexDataError();
  }
  return value;
}

function initialsFor(fullName: string): string {
  const parts = fullName.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : '';
  return `${first}${last}`.toLocaleUpperCase('es-BO');
}

function accentFor(trainingLevel: LeaderTrainingLevel): LeaderAccent {
  if (trainingLevel === 'IM III') {
    return 'yellow';
  }
  if (trainingLevel === 'Sin registro') {
    return 'neutral';
  }
  return 'blue';
}

function safeImageUrl(value: string | null): string | null {
  if (!value || value.startsWith('//') || value.includes('\\')) {
    return null;
  }
  const hasScheme = /^[A-Za-z][A-Za-z\d+.-]*:/.test(value);
  if (!hasScheme) {
    return value;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}
