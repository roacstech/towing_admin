"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AdminUser } from "@/types/auth";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  updateUser: (updatedFields: Partial<AdminUser>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state from localStorage & backend DB
  const syncUserFromStorage = useCallback(() => {
    try {
      const storedToken = localStorage.getItem("admin_token");
      const storedUser = localStorage.getItem("admin_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        // Fetch latest profile from DB to keep dynamic
        if (parsed.email) {
          fetch(`/api/profile?email=${encodeURIComponent(parsed.email)}`, { cache: "no-store" })
            .then((res) => res.json())
            .then((json) => {
              if (json.success && json.data) {
                const updated = {
                  ...parsed,
                  name: json.data.name || parsed.name,
                  phone: json.data.phone || parsed.phone,
                  email: json.data.email || parsed.email,
                };
                setUser(updated);
                localStorage.setItem("admin_user", JSON.stringify(updated));
              }
            })
            .catch(() => {});
        }
      }
    } catch {
      // Local storage empty or corrupt
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncUserFromStorage();

    const handleUpdate = () => {
      try {
        const storedUser = localStorage.getItem("admin_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (_) {}
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("admin_user_updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("admin_user_updated", handleUpdate);
    };
  }, [syncUserFromStorage]);

  const login = (newToken: string, newUser: AdminUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_user", JSON.stringify(newUser));
  };

  const updateUser = (updatedFields: Partial<AdminUser>) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...updatedFields } : ({ ...updatedFields } as AdminUser);
      try {
        localStorage.setItem("admin_user", JSON.stringify(updated));
        window.dispatchEvent(new Event("admin_user_updated"));
      } catch (_) {}
      return updated;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
