import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BASE_URL = "http://localhost:3000/api/v1";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(true);

  // Fetch user data from /me endpoint
  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
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
      localStorage.removeItem("token");
      throw error;
    }
  };

  // Login method
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Login failed");
      }

      const data = await res.json();
      const newToken = data.access_token;

      setToken(newToken);
      localStorage.setItem("token", newToken);

      await fetchUser(newToken);
    } catch (error) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
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

  // Logout method
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // On mount, check if token exists and fetch user
  useEffect(() => {
    if (token) {
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout }}
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
