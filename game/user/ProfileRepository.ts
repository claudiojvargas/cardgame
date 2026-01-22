import type { UserProfile } from "./UserProfile";

export interface ProfileRepository {
  load(): UserProfile | null;
  save(profile: UserProfile): void;
  reset(): void;
}
