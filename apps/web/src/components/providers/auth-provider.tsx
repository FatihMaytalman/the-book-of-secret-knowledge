'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  TOKEN_KEY,
  USER_KEY,
  type AuthSession,
  type AuthUser,
} from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function persist(session: AuthSession): AuthUser {
  window.localStorage.setItem(TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  // Mirror the token into a cookie so server components can authenticate SSR fetches.
  document.cookie = `${TOKEN_KEY}=${session.accessToken}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  return session.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as AuthUser);
      }
    } catch {
      // ignore malformed storage
    }
    setIsReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(persist(await apiLogin(email, password)));
  }, []);

  const register = useCallback(
    async (email: string, displayName: string, password: string) => {
      setUser(persist(await apiRegister(email, displayName, password)));
    },
    [],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, register, logout }),
    [user, isReady, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
