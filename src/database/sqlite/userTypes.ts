export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  updated_at: number;
};

export type UserQuery = {
  role?: string | null;
  search?: string;
};
