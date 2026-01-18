import { Deck } from "../entities/Deck";
import { Rarity } from "../types/enums";
import { CARDS } from "../data/cards.catalog";

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export class TowerEnemyFactory {
  static createEnemy(floor: number): Deck {
    const allowedRarities = new Set<Rarity>([Rarity.COMMON, Rarity.UNCOMMON]);

    if (floor > 5) {
      allowedRarities.add(Rarity.RARE);
    }

    if (floor > 12) {
      allowedRarities.add(Rarity.EPIC);
    }

    if (floor > 20) {
      allowedRarities.add(Rarity.LEGENDARY);
    }

    if (floor > 25) {
      allowedRarities.add(Rarity.MYTHIC);
      allowedRarities.add(Rarity.DIAMOND);
    }

    const pool = CARDS.filter(card => allowedRarities.has(card.rarity));
    const picks = shuffle(pool).slice(0, 6).map(card => card.clone());

    const fallback = shuffle(CARDS).slice(0, 6).map(card => card.clone());
    return new Deck(picks.length === 6 ? picks : fallback);
  }
}
