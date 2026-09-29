"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getNutritionistProfile } from "@/lib/nutritionists/api";
import type { NutritionistProfile } from "@/lib/nutritionists/types";

type ProfileState = {
  /** The signed-in nutritionist's profile; null until loaded (or if it failed to load). */
  profile: NutritionistProfile | null;
  /** Replace the shared copy — the settings page calls this after a save so the banner clears at once. */
  setProfile: (profile: NutritionistProfile) => void;
};

const ProfileContext = createContext<ProfileState>({ profile: null, setProfile: () => {} });

/**
 * One read of the nutritionist's own profile, shared by whatever in the
 * dashboard shell needs it (today: the "complete your profile" banner).
 * Mounted only for nutritionists (AppShell) — the endpoint is role-gated,
 * so an admin would get a 403. The settings page pushes its saved copy
 * back through `setProfile`, so the banner reacts to a save without a
 * reload or a second fetch.
 */
export function NutritionistProfileProvider({ children }: { children: React.ReactNode }) {
  const { authorizedFetch } = useAuth();
  const [profile, setProfileState] = useState<NutritionistProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    getNutritionistProfile(authorizedFetch).then((result) => {
      if (!cancelled && result.ok) setProfileState(result.data);
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  const setProfile = useCallback((next: NutritionistProfile) => setProfileState(next), []);
  const value = useMemo(() => ({ profile, setProfile }), [profile, setProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useNutritionistProfile(): ProfileState {
  return useContext(ProfileContext);
}
