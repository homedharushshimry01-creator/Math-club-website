import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const AUTH_KEY = "aans_math_admin_session";

// Hardcoded prototype credentials — in production this is a real
// Supabase auth call. We persist the session flag in localStorage so
// refreshing the page keeps the admin logged in.
export const ADMIN_USERNAME = "AANS";
export const ADMIN_PASSWORD = "Mahematics_Club@AANS";

type AuthCtx = {
  isAdmin: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, isAdmin ? "true" : "false");
  }, [isAdmin]);

  const login = (u: string, p: string) => {
    if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

  return <Ctx.Provider value={{ isAdmin, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
