export type User = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: string;
  roles: string[];
};
