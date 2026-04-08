export type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

/**
 * Strip GraphQL extras (e.g. __typename) and coerce to our persisted `User` shape.
 */
export function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string') return null;

  const str = (v: unknown) =>
    v == null ? null : typeof v === 'string' ? v : String(v);

  return {
    id: r.id,
    name: str(r.name),
    email: str(r.email),
    role: str(r.role),
  };
}

export function normalizeUsers(rawItems: unknown[]): User[] {
  const out: User[] = [];
  for (const item of rawItems) {
    const u = normalizeUser(item);
    if (u) out.push(u);
  }
  return out;
}
