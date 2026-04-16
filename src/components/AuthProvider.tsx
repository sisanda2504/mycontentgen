import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type User, getSession, signIn, signUp, signOut } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => void;
  register: (email: string, password: string, name: string) => void;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(getSession());
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    try {
      setError(null);
      const u = signIn(email, password);
      setUser(u);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const register = (email: string, password: string, name: string) => {
    try {
      setError(null);
      const u = signUp(email, password, name);
      setUser(u);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const logout = () => {
    signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, error, clearError: () => setError(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
