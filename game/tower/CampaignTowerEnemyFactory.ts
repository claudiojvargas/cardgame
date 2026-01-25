import { Deck } from "../entities/Deck";
import { Rarity } from "../types/enums";
import { CARDS } from "../data/cards.catalog";
import { createSeededRng } from "../utils/random";

function shuffleWithRng<T>(items: T[], rng: ReturnType<typeof createSeededRng>): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class CampaignTowerEnemyFactory {
  static createEnemy(floor: number): Deck {
    const rng = createSeededRng(1000 + floor * 7919);
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
    const picks = shuffleWithRng(pool, rng).slice(0, 6).map(card => card.clone());

    const fallback = shuffleWithRng(CARDS, rng).slice(0, 6).map(card => card.clone());
    return new Deck(picks.length === 6 ? picks : fallback);
  }
}
