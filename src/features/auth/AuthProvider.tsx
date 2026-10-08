import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getCurrentSession,
  signIn as signInRequest,
  signOut as signOutRequest,
  signUp as signUpRequest,
  subscribeToAuth,
  type AuthResult,
} from "./auth.service";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult<{ session: Session | null; user: User | null }>>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<AuthResult<{ session: Session | null; user: User | null }>>;
  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getCurrentSession().then(({ data }) => {
      if (mounted) {
        setSession(data);
        setLoading(false);
      }
    });

    const subscription = subscribeToAuth((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (email: string, password: string) => {
        const result = await signInRequest(email, password);
        if (result.data?.session) {
          setSession(result.data.session);
        }
        return result;
      },
      signUp: async (email: string, password: string, displayName: string) => {
        const result = await signUpRequest(email, password, displayName);
        if (result.data?.session) {
          setSession(result.data.session);
        }
        return result;
      },
      signOut: async () => {
        const result = await signOutRequest();
        if (!result.error) {
          setSession(null);
        }
        return result;
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
