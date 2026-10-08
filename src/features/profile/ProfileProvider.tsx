import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthProvider";
import { getProfile, updateProfile as updateProfileRequest } from "./profile.service";
import type { Profile } from "./profile.types";

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    changes: Partial<Pick<Profile, "display_name" | "avatar_url" | "timezone" | "locale">>,
  ) => Promise<{ error: string | null }>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id ?? null;

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await getProfile(userId);
    setProfile(result.data);
    setError(result.error);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    let active = true;

    if (!userId) {
      return () => {
        active = false;
      };
    }

    void (async () => {
      setLoading(true);
      setError(null);
      const result = await getProfile(userId);
      if (!active) {
        return;
      }
      setProfile(result.data);
      setError(result.error);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const updateProfile = useCallback(
    async (
      changes: Partial<Pick<Profile, "display_name" | "avatar_url" | "timezone" | "locale">>,
    ) => {
      if (!userId) {
        return { error: "Sign in to update your profile." };
      }

      const result = await updateProfileRequest(userId, changes);
      if (result.data) {
        setProfile(result.data);
      }
      setError(result.error);
      return { error: result.error };
    },
    [userId],
  );

  const value = useMemo(
    () => ({
      profile: userId ? profile : null,
      loading: userId ? loading : false,
      error: userId ? error : null,
      refreshProfile,
      updateProfile,
    }),
    [error, loading, profile, refreshProfile, updateProfile, userId],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside a ProfileProvider");
  }

  return context;
}
