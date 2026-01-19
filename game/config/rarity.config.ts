import { CardClass, Rarity } from "../types/enums";

export interface RarityConfig {
  minPower: number;
  maxPower: number;
  maxAwakening: number;
  cardClass: CardClass;
}

const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  [Rarity.COMMON]: {
    minPower: 10,
    maxPower: 20,
    maxAwakening: 3,
    cardClass: CardClass.ATTACK,
  },
  [Rarity.UNCOMMON]: {
    minPower: 21,
    maxPower: 40,
    maxAwakening: 3,
    cardClass: CardClass.DEFENSE,
  },
  [Rarity.RARE]: {
    minPower: 41,
    maxPower: 60,
    maxAwakening: 5,
    cardClass: CardClass.SUPPORT,
  },
  [Rarity.EPIC]: {
    minPower: 61,
    maxPower: 85,
    maxAwakening: 5,
    cardClass: CardClass.CONTROL,
  },
  [Rarity.LEGENDARY]: {
    minPower: 86,
    maxPower: 115,
    maxAwakening: 7,
    cardClass: CardClass.CONTINUOUS,
  },
  [Rarity.MYTHIC]: {
    minPower: 116,
    maxPower: 150,
    maxAwakening: 7,
    cardClass: CardClass.STRATEGY,
  },
  [Rarity.DIAMOND]: {
    minPower: 151,
    maxPower: 200,
    maxAwakening: 10,
    cardClass: CardClass.STRATEGY,
  },
};

export function getRarityConfig(rarity: Rarity): RarityConfig {
  return RARITY_CONFIG[rarity];
}
