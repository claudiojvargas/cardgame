import { Rarity } from "../types/enums";
import { Card } from "../entities/Card";

const RARITY_POWER_BONUS: Record<Rarity, number> = {
  [Rarity.COMMON]: 0,
  [Rarity.UNCOMMON]: 1,
  [Rarity.RARE]: 3,
  [Rarity.EPIC]: 5,
  [Rarity.LEGENDARY]: 8,
  [Rarity.MYTHIC]: 12,
  [Rarity.DIAMOND]: 18,
};

export class PowerSystem {
  static calculateInitialPower(card: Card): number {
    return (
      card.basePower +
      RARITY_POWER_BONUS[card.rarity] +
      card.developments
    );
  }
}