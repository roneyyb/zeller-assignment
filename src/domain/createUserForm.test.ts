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

  it('rejects non-capitalized first/last name', () => {
    const res = createUserFormSchema.safeParse({
      firstName: 'ada',
      lastName: 'lovelace',
      email: 'ada@example.com',
      role: 'Admin',
    });
    expect(res.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const res = createUserFormSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'not-an-email',
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

  it('rejects empty last name', () => {
    const res = createUserFormSchema.safeParse({
      firstName: 'Ada',
      lastName: '',
      email: 'ada@example.com',
      role: 'Admin',
    });
    expect(res.success).toBe(false);
  });

  it('rejects digits or punctuation in names', () => {
    const res = createUserFormSchema.safeParse({
      firstName: 'Ada2',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: 'Admin',
    });
    expect(res.success).toBe(false);
  });

  it('rejects first name longer than 50 characters', () => {
    const res = createUserFormSchema.safeParse({
      firstName: 'A'.repeat(51),
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: 'Admin',
    });
    expect(res.success).toBe(false);
  });

  it('rejects email without proper domain (a@b)', () => {
    const res = createUserFormSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'a@b',
      role: 'Admin',
    });
    expect(res.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const res = createUserFormSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: 'Guest',
    });
    expect(res.success).toBe(false);
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

