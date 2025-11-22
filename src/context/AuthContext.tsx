import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signup: (data: { firstName: string; lastName: string; gender: string; phoneNumber: string; email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = "http://localhost:4001";

export async function apiFetch(path: string, options: RequestInit = {}) {
  // Don't set Content-Type for FormData - let browser set it with boundary
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = isFormData
    ? { ...(options.headers || {}) }
    : {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type");
  const data = contentType && contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch("/api/auth/me", { method: "GET" });
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signup: AuthContextValue["signup"] = async ({ firstName, lastName, gender, phoneNumber, email, password }) => {
    const data = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, gender, phoneNumber, email, password }),
    });
    setUser(data);
  };

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data);
    return data;
  };

  const logout: AuthContextValue["logout"] = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
