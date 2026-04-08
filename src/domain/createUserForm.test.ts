import { buildFullName, createUserFormSchema, toApiRole } from './createUserForm';

describe('createUserFormSchema', () => {
  it('rejects empty first name', () => {
    const res = createUserFormSchema.safeParse({
      firstName: '',
      lastName: '',
      email: '',
      role: 'Admin',
    });
    expect(res.success).toBe(false);
  });

  it('accepts valid values', () => {
    const res = createUserFormSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: 'Manager',
    });
    expect(res.success).toBe(true);
  });
});

describe('helpers', () => {
  it('buildFullName trims and joins', () => {
    expect(buildFullName(' Ada ', '  Lovelace ')).toBe('Ada Lovelace');
  });

  it('toApiRole uppercases', () => {
    expect(toApiRole('Admin')).toBe('ADMIN');
  });
});

