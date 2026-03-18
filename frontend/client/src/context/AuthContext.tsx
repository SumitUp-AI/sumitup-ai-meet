import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
  tenant_domain?: string;
  tenant_settings?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    remember_me: boolean,
  ) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch user data from /me endpoint
  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch(`${BASE_URL}/me`, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          "X-Tenant-ID": user?.tenant_id || "",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData = await res.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  // Login method
  const login = async (
    email: string,
    password: string,
    remember_me: boolean,
  ) => {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember_me }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Login failed");
      }

      const data = await res.json();
      const newToken = data.access_token;
      setToken(newToken);

      await fetchUser(newToken);
    } catch (error) {
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  // Signup method
  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Signup failed");
      }

      // After signup, redirect to login (don't auto-login)
      return await res.json();
    } catch (error) {
      throw error;
    }
  };

  // Refresh token method
  const refreshToken = useCallback(async () => {
    const res = await fetch(`${BASE_URL}/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-Tenant-ID": user?.tenant_id || "",
      },
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    setToken(data.access_token);
    return data.access_token;
  }, [user?.tenant_id]);

  // Logout method
  const logout = useCallback(async () => {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setToken(null);
    window.location.href = "/login";
  }, []);

  // Auto refresh token every 14 minutes (assuming 15 min expiry)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const newToken = await refreshToken();
        await fetchUser(newToken);
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
