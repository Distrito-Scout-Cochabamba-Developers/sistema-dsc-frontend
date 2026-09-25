/** Nivel de formación transportado por la API de Kardex. */
export type LeaderTrainingLevel = 'IM I-II' | 'IM III' | 'Sin registro';

/** Estado normalizado de un módulo de formación. */
export type LeaderTrainingStatus = 'completed' | 'enrolled' | 'pending';

/** Color semántico derivado para elementos visuales del dirigente. */
export type LeaderAccent = 'blue' | 'yellow' | 'neutral';

/** DTO camelCase de una tarjeta del directorio ASP.NET Core. */
export interface LeaderSummaryDto {
  readonly id: string;
  readonly fullName: string;
  readonly ci: string;
  readonly role: string;
  readonly scoutGroup: string;
  readonly branch: string;
  readonly trainingLevel: LeaderTrainingLevel;
  readonly avatarUrl: string | null;
}

/** DTO camelCase de un módulo dentro de la ficha digital. */
export interface LeaderTrainingModuleDto {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly status: LeaderTrainingStatus;
  readonly completedAt?: string | null;
}

/** DTO camelCase de la ficha completa entregada por ASP.NET Core. */
export interface LeaderDetailDto extends LeaderSummaryDto {
  readonly email: string | null;
  readonly phone: string | null;
  readonly district: string;
  readonly joinedAt: string | null;
  readonly trainingModules: readonly LeaderTrainingModuleDto[];
}

/** DTO camelCase de los catálogos usados por los filtros. */
export interface LeaderFilterOptionsDto {
  readonly scoutGroups: readonly string[];
  readonly branches: readonly string[];
  readonly trainingLevels: readonly LeaderTrainingLevel[];
}

/** Modelo de presentación de una tarjeta del directorio. */
export interface LeaderSummary {
  readonly id: string;
  readonly fullName: string;
  readonly ci: string;
  readonly role: string;
  readonly scoutGroup: string;
  readonly branch: string;
  readonly trainingLevel: LeaderTrainingLevel;
  readonly avatarUrl: string | null;
  readonly accent: LeaderAccent;
  readonly initials: string;
}

/** Modelo de presentación de un módulo formativo. */
export interface LeaderTrainingModule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: LeaderTrainingStatus;
  readonly statusLabel: string;
  readonly completedAt: string | null;
}

/** Modelo de presentación de la ficha digital de un dirigente. */
export interface LeaderDetail extends LeaderSummary {
  readonly email: string | null;
  readonly phone: string | null;
  readonly district: string;
  readonly joinedAt: string | null;
  readonly trainingModules: readonly LeaderTrainingModule[];
}

/** Filtros admitidos por el directorio y su endpoint HTTP. */
export interface LeaderDirectoryQuery {
  readonly search?: string;
  readonly scoutGroup?: string;
  readonly branch?: string;
  readonly trainingLevel?: LeaderTrainingLevel;
}

/** Catálogos listos para construir los selectores del directorio. */
export interface LeaderFilterOptions {
  readonly scoutGroups: readonly string[];
  readonly branches: readonly string[];
  readonly trainingLevels: readonly LeaderTrainingLevel[];
}
