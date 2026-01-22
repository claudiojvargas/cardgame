import type { UserProfile } from "./UserProfile";
import type { ProfileRepository } from "./ProfileRepository";

const STORAGE_KEY = "cardgame.profile.v1";

export class ProfileRepositoryLocalStorage implements ProfileRepository {
  load(): UserProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as UserProfile;
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  }

  save(profile: UserProfile): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  reset(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
