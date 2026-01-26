import { STARTER_DECK_IDS } from "../data/starterDeck";
import { Rarity } from "../types/enums";

export type CurrencyType = "gold" | "diamonds";

export interface UserProfile {
  id: string;
  displayName: string;
  avatarId: string;
  createdAt: string;
  lastLoginAt: string;
  currencies: {
    gold: number;
    diamonds: number;
  };
  progress: {
    tower: {
      bestFloor: number;
      runs: number;
      wins: number;
      losses: number;
    };
  };
  collection: {
    inventory: Record<string, number>;
    isNew: Record<string, boolean>;
    awakenings: Record<string, number>;
    deckIds: string[];
  };
  stats: {
    chestsOpened: Record<string, number>;
    combinesByRarity: Record<Rarity, number>;
    incense: Record<Rarity, number>;
  };
}

export function createRarityRecord(defaultValue = 0): Record<Rarity, number> {
  return Object.values(Rarity).reduce<Record<Rarity, number>>((acc, rarity) => {
    acc[rarity] = defaultValue;
    return acc;
  }, {} as Record<Rarity, number>);
}

export function createDefaultProfile(
  starterCardIds: string[] = [...STARTER_DECK_IDS]
): UserProfile {
  const now = new Date().toISOString();
  const inventory: Record<string, number> = {};
  const isNew: Record<string, boolean> = {};
  starterCardIds.forEach(cardId => {
    inventory[cardId] = (inventory[cardId] ?? 0) + 1;
    isNew[cardId] = true;
  });

  return {
    id: `local-${Date.now()}`,
    displayName: "Jogador",
    avatarId: "default",
    createdAt: now,
    lastLoginAt: now,
    currencies: {
      gold: 0,
      diamonds: 0,
    },
    progress: {
      tower: {
        bestFloor: 1,
        runs: 0,
        wins: 0,
        losses: 0,
      },
    },
    collection: {
      inventory,
      isNew,
      awakenings: {},
      deckIds: [...starterCardIds],
    },
    stats: {
      chestsOpened: {},
      combinesByRarity: createRarityRecord(0),
      incense: createRarityRecord(0),
    },
  };
}
