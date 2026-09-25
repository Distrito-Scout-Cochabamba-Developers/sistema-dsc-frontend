import {
  KardexDataError,
  mapLeaderDetailDto,
  mapLeaderFilterOptionsDto,
  mapLeaderSummaryListDto,
  mapLeaderSummaryDto,
} from './kardex.mapper';

describe('Kardex DTO mapper', () => {
  it('derives presentation fields and keeps a safe HTTPS avatar', () => {
    const leader = mapLeaderSummaryDto({
      id: 'leader-ana-silva',
      fullName: 'Ana María Silva',
      ci: '3.210.987-6',
      role: 'Responsable de Grupo',
      scoutGroup: 'Alemán',
      branch: 'Comunidad',
      trainingLevel: 'IM III',
      avatarUrl: 'https://cdn.example.org/leaders/ana.jpg',
    });

    expect(leader.initials).toBe('AS');
    expect(leader.accent).toBe('yellow');
    expect(leader.avatarUrl).toBe('https://cdn.example.org/leaders/ana.jpg');
  });

  it.each([
    'http://unsafe.example/avatar.jpg',
    'javascript:alert(1)',
    '//unsafe.example/avatar.jpg',
    '/\\unsafe.example/avatar.jpg',
  ])('discards the unsafe avatar URL %s', (avatarUrl) => {
    const leader = mapLeaderSummaryDto({
      id: 'leader-carlos-mendoza',
      fullName: 'Carlos Mendoza',
      ci: '4.567.890-1',
      role: 'Responsable de Tropa',
      scoutGroup: 'Panda',
      branch: 'Tropa',
      trainingLevel: 'IM I-II',
      avatarUrl,
    });

    expect(leader.avatarUrl).toBeNull();
  });

  it('maps module statuses to safe labels instead of transport-owned classes', () => {
    const leader = mapLeaderDetailDto({
      id: 'leader-carlos-mendoza',
      fullName: 'Carlos Mendoza',
      ci: '4.567.890-1',
      role: 'Responsable de Tropa',
      scoutGroup: 'Panda',
      branch: 'Tropa',
      trainingLevel: 'IM I-II',
      avatarUrl: '/images/carlos.jpg',
      email: 'carlos@example.org',
      phone: '70000000',
      district: 'La Paz',
      joinedAt: '2019-03-16',
      trainingModules: [
        {
          id: 'wood-badge',
          name: 'Insignia de Madera I-II',
          description: 'Formación base para responsables de unidad.',
          status: 'completed',
          completedAt: '2025-03-10',
        },
        {
          id: 'leadership',
          name: 'Liderazgo y Servicio',
          description: 'Herramientas para acompañar equipos adultos.',
          status: 'enrolled',
          completedAt: null,
        },
        {
          id: 'safety',
          name: 'Seguridad en Actividades',
          description: 'Prevención y respuesta durante actividades.',
          status: 'pending',
          completedAt: null,
        },
      ],
    });

    expect(leader.trainingModules.map((module) => module.statusLabel)).toEqual([
      'Completado',
      'Inscrito',
      'Pendiente',
    ]);
    expect(leader.trainingModules[0]).toEqual({
      id: 'wood-badge',
      name: 'Insignia de Madera I-II',
      description: 'Formación base para responsables de unidad.',
      status: 'completed',
      statusLabel: 'Completado',
      completedAt: '2025-03-10',
    });
    expect(leader.avatarUrl).toBe('/images/carlos.jpg');
  });

  it('rejects PascalCase and unknown enum values as an invalid ASP.NET Core contract', () => {
    expect(() =>
      mapLeaderSummaryDto({
        Id: 'leader-ana-silva',
        FullName: 'Ana Silva',
        ci: '3.210.987-6',
        role: 'Responsable de Grupo',
        scoutGroup: 'Alemán',
        branch: 'Comunidad',
        trainingLevel: 'advanced',
        avatarUrl: null,
      }),
    ).toThrow(KardexDataError);
  });

  it('rejects an ID that exposes the normalized CI', () => {
    expect(() =>
      mapLeaderSummaryDto({
        id: 'leader-32109876',
        fullName: 'Ana Silva',
        ci: '3.210.987-6',
        role: 'Responsable de Grupo',
        scoutGroup: 'Alemán',
        branch: 'Comunidad',
        trainingLevel: 'IM III',
        avatarUrl: null,
      }),
    ).toThrow(KardexDataError);
  });

  it.each(['.', '..', 'leader/unsafe', ' leader-safe'])('rejects the unsafe opaque ID %s', (id) => {
    expect(() =>
      mapLeaderSummaryDto({
        id,
        fullName: 'Dirigente Seguro',
        ci: '1234567',
        role: 'Responsable',
        scoutGroup: 'Panda',
        branch: 'Tropa',
        trainingLevel: 'IM I-II',
        avatarUrl: null,
      }),
    ).toThrow(KardexDataError);
  });

  it('rejects non-array lists and duplicate leader IDs', () => {
    expect(() => mapLeaderSummaryListDto({ items: [] })).toThrow(KardexDataError);
    const leader = {
      id: 'leader-safe',
      fullName: 'Dirigente Seguro',
      ci: '1234567',
      role: 'Responsable',
      scoutGroup: 'Panda',
      branch: 'Tropa',
      trainingLevel: 'IM I-II',
      avatarUrl: null,
    };

    expect(() => mapLeaderSummaryListDto([leader, leader])).toThrow(KardexDataError);
  });

  it('rejects duplicate module IDs', () => {
    const duplicatedModule = {
      id: 'same-module',
      name: 'Módulo repetido',
      description: 'No debe repetirse.',
      status: 'pending',
      completedAt: null,
    };

    expect(() =>
      mapLeaderDetailDto({
        id: 'leader-safe',
        fullName: 'Dirigente Seguro',
        ci: '1234567',
        role: 'Responsable',
        scoutGroup: 'Panda',
        branch: 'Tropa',
        trainingLevel: 'IM I-II',
        avatarUrl: null,
        email: null,
        phone: null,
        district: 'La Paz',
        joinedAt: null,
        trainingModules: [duplicatedModule, duplicatedModule],
      }),
    ).toThrow(KardexDataError);
  });

  it('deduplicates repeated filter values', () => {
    expect(
      mapLeaderFilterOptionsDto({
        scoutGroups: ['Panda', 'Panda'],
        branches: ['Tropa', 'Tropa'],
        trainingLevels: ['IM I-II', 'IM I-II'],
      }),
    ).toEqual({ scoutGroups: ['Panda'], branches: ['Tropa'], trainingLevels: ['IM I-II'] });
  });
});
