"use client";

import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, token, isLoading, login, logout, updateUser } = useAuthContext();

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
  };
}
