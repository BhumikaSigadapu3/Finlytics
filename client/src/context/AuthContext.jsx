import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService.js";
import { saveSession, clearSession, getStoredToken } from "../utils/session.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sso, setSso] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* token may already be invalid */
    }
    clearSession();
    setUser(null);
    setSso(null);
  }, []);

  const applyAuth = useCallback((data) => {
    saveSession(data.token, data.sso);
    setUser(data.user);
    setSso(data.sso ?? null);
    return data.user;
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setBootstrapping(false);
      return;
    }
    authService
      .fetchMe()
      .then((res) => {
        setUser(res.user);
        setSso(res.sso ?? null);
      })
      .catch(() => {
        clearSession();
        setUser(null);
        setSso(null);
      })
      .finally(() => setBootstrapping(false));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await authService.login({ email, password });
      return applyAuth(data);
    },
    [applyAuth]
  );

  const register = useCallback(
    async (name, email, password) => {
      const data = await authService.register({ name, email, password });
      return applyAuth(data);
    },
    [applyAuth]
  );

  const isAdmin = user?.role === "admin";

  const value = useMemo(
    () => ({ user, sso, bootstrapping, login, register, logout, isAdmin }),
    [user, sso, bootstrapping, login, register, logout, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
