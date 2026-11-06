export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "dispatcher" | "support";
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: AdminUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

