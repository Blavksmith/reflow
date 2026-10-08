import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export type AuthResult<T = void> = {
  data: T | null;
  error: string | null;
};

const configurationError =
  "Authentication is not configured yet. Add the Supabase environment variables to continue.";

function getErrorMessage(error: { message?: string } | null) {
  return error?.message || "Something went wrong. Please try again.";
}

export async function getCurrentSession(): Promise<AuthResult<Session>> {
  if (!supabase || !isSupabaseConfigured) {
    return { data: null, error: configurationError };
  }

  const { data, error } = await supabase.auth.getSession();
  return { data: data.session, error: error ? getErrorMessage(error) : null };
}

export function subscribeToAuth(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  if (!supabase || !isSupabaseConfigured) {
    return { unsubscribe: () => undefined };
  }

  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult<{ session: Session | null; user: User | null }>> {
  if (!supabase || !isSupabaseConfigured) {
    return { data: null, error: configurationError };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    data: error ? null : { session: data.session, user: data.user },
    error: error ? getErrorMessage(error) : null,
  };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResult<{ session: Session | null; user: User | null }>> {
  if (!supabase || !isSupabaseConfigured) {
    return { data: null, error: configurationError };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  return {
    data: error ? null : { session: data.session, user: data.user },
    error: error ? getErrorMessage(error) : null,
  };
}

export async function signOut(): Promise<AuthResult> {
  if (!supabase || !isSupabaseConfigured) {
    return { data: null, error: configurationError };
  }

  const { error } = await supabase.auth.signOut();
  return { data: null, error: error ? getErrorMessage(error) : null };
}
