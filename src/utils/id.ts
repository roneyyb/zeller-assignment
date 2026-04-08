export function createLocalId(): string {
  // Simple, collision-resistant enough for local-only rows (assignment scope).
  return `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

