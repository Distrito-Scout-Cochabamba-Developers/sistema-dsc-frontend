import { describe, expect, it } from 'vitest';

import { joinPersonName, splitFullName } from './person-name.utils';

describe('splitFullName', () => {
  it('separa el primer token como nombre y el resto como apellidos', () => {
    expect(splitFullName('Juan Pérez Mendoza')).toEqual({
      firstName: 'Juan',
      lastName: 'Pérez Mendoza',
    });
  });

  it('duplica el único token para FirstName y LastName', () => {
    expect(splitFullName('Juan')).toEqual({ firstName: 'Juan', lastName: 'Juan' });
  });
});

describe('joinPersonName', () => {
  it('concatena nombre y apellidos', () => {
    expect(joinPersonName('María', 'López Quispe')).toBe('María López Quispe');
  });
});
