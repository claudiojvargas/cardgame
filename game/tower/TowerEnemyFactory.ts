import { Deck } from "../entities/Deck";
import { Rarity } from "../types/enums";
import { CARDS } from "../data/cards.catalog";

const RARITY_ORDER: Rarity[] = [
  Rarity.COMMON,
  Rarity.UNCOMMON,
  Rarity.RARE,
  Rarity.EPIC,
  Rarity.LEGENDARY,
  Rarity.MYTHIC,
  Rarity.DIAMOND,
];

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export class TowerEnemyFactory {
  static createEnemy(floor: number): Deck {
    const rarityIndex = Math.min(
      RARITY_ORDER.length - 1,
      Math.floor((floor - 1) / 5)
    );
    const allowedRarities = new Set(RARITY_ORDER.slice(0, rarityIndex + 1));

    const pool = CARDS.filter(card => allowedRarities.has(card.rarity));
    const picks = shuffle(pool).slice(0, 6).map(card => card.clone());

    const fallback = shuffle(CARDS).slice(0, 6).map(card => card.clone());
    return new Deck(picks.length === 6 ? picks : fallback);
  }
}
