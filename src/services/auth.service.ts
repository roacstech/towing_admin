import { AdminUser, AuthSession, LoginCredentials } from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to log in.");
    }

    const session: AuthSession = {
      token: data.token,
      user: data.user,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("admin_token", session.token);
      localStorage.setItem("admin_user", JSON.stringify(session.user));
    }

    return session;
  },

  getCurrentUser(): AdminUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("admin_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    }
  },
};
