import { Rarity } from "../types/enums";
import type { ProfileRepository } from "./ProfileRepository";
import type { CurrencyType, UserProfile } from "./UserProfile";
import { createDefaultProfile } from "./UserProfile";

const INCENSE_THRESHOLD = 15;
const DIAMOND_INCENSE_THRESHOLD = 100;

export class ProfileService {
  private profile: UserProfile;

  constructor(private repository: ProfileRepository, initialProfile?: UserProfile) {
    const stored = initialProfile ?? repository.load();
    this.profile = stored ?? createDefaultProfile();
    this.profile = {
      ...this.profile,
      lastLoginAt: new Date().toISOString(),
    };
    this.repository.save(this.profile);
  }

  getProfile(): UserProfile {
    return this.profile;
  }

  rename(displayName: string): UserProfile {
    return this.commit({ ...this.profile, displayName });
  }

  addCurrency(type: CurrencyType, amount: number): UserProfile {
    const nextAmount = Math.max(0, this.profile.currencies[type] + amount);
    return this.commit({
      ...this.profile,
      currencies: {
        ...this.profile.currencies,
        [type]: nextAmount,
      },
    });
  }

  spendCurrency(type: CurrencyType, amount: number): UserProfile {
    const nextAmount = Math.max(0, this.profile.currencies[type] - amount);
    return this.commit({
      ...this.profile,
      currencies: {
        ...this.profile.currencies,
        [type]: nextAmount,
      },
    });
  }

  addCard(cardId: string, qty = 1): UserProfile {
    const currentQty = this.profile.collection.inventory[cardId] ?? 0;
    return this.commit({
      ...this.profile,
      collection: {
        ...this.profile.collection,
        inventory: {
          ...this.profile.collection.inventory,
          [cardId]: currentQty + qty,
        },
      },
    });
  }

  removeCard(cardId: string, qty = 1): UserProfile {
    const currentQty = this.profile.collection.inventory[cardId] ?? 0;
    const nextQty = Math.max(0, currentQty - qty);
    return this.commit({
      ...this.profile,
      collection: {
        ...this.profile.collection,
        inventory: {
          ...this.profile.collection.inventory,
          [cardId]: nextQty,
        },
      },
    });
  }

  markCardNew(cardId: string): UserProfile {
    return this.commit({
      ...this.profile,
      collection: {
        ...this.profile.collection,
        isNew: {
          ...this.profile.collection.isNew,
          [cardId]: true,
        },
      },
    });
  }

  markAllAsSeen(): UserProfile {
    return this.commit({
      ...this.profile,
      collection: {
        ...this.profile.collection,
        isNew: {},
      },
    });
  }

  setAwakening(cardId: string, value: number): UserProfile {
    return this.commit({
      ...this.profile,
      collection: {
        ...this.profile.collection,
        awakenings: {
          ...this.profile.collection.awakenings,
          [cardId]: value,
        },
      },
    });
  }

  recordTowerRunStart(): UserProfile {
    return this.commit({
      ...this.profile,
      progress: {
        ...this.profile.progress,
        tower: {
          ...this.profile.progress.tower,
          runs: this.profile.progress.tower.runs + 1,
        },
      },
    });
  }

  recordTowerResult({ win, floor }: { win: boolean; floor: number }): UserProfile {
    const wins = this.profile.progress.tower.wins + (win ? 1 : 0);
    const losses = this.profile.progress.tower.losses + (win ? 0 : 1);
    const bestFloor = win
      ? Math.max(this.profile.progress.tower.bestFloor, floor)
      : this.profile.progress.tower.bestFloor;

    return this.commit({
      ...this.profile,
      progress: {
        ...this.profile.progress,
        tower: {
          ...this.profile.progress.tower,
          wins,
          losses,
          bestFloor,
        },
      },
    });
  }

  recordChestOpened(chestId: string): UserProfile {
    const current = this.profile.stats.chestsOpened[chestId] ?? 0;
    return this.commit({
      ...this.profile,
      stats: {
        ...this.profile.stats,
        chestsOpened: {
          ...this.profile.stats.chestsOpened,
          [chestId]: current + 1,
        },
      },
    });
  }

  recordCombine(rarity: Rarity): UserProfile {
    const current = this.profile.stats.combinesByRarity[rarity] ?? 0;
    return this.commit({
      ...this.profile,
      stats: {
        ...this.profile.stats,
        combinesByRarity: {
          ...this.profile.stats.combinesByRarity,
          [rarity]: current + 1,
        },
      },
    });
  }

  updateIncense(rarity: Rarity, reset = false): UserProfile {
    if (reset) {
      return this.commit({
        ...this.profile,
        stats: {
          ...this.profile.stats,
          incense: {
            ...this.profile.stats.incense,
            [rarity]: 0,
          },
        },
      });
    }

    const current = this.profile.stats.incense[rarity] ?? 0;
    return this.commit({
      ...this.profile,
      stats: {
        ...this.profile.stats,
        incense: {
          ...this.profile.stats.incense,
          [rarity]: current + 1,
        },
      },
    });
  }

  getIncenseThreshold(rarity: Rarity): number {
    return rarity === Rarity.DIAMOND ? DIAMOND_INCENSE_THRESHOLD : INCENSE_THRESHOLD;
  }

  private commit(profile: UserProfile): UserProfile {
    this.profile = profile;
    this.repository.save(this.profile);
    return this.profile;
  }
}
