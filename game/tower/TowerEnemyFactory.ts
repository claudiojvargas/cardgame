import { Deck } from "../entities/Deck";
import { Card } from "../entities/Card";
import { CardClass, Rarity } from "../types/enums";

export class TowerEnemyFactory {
  static createEnemy(floor: number): Deck {
    const rarity =
      floor <= 5 ? Rarity.COMMON :
      floor <= 10 ? Rarity.UNCOMMON :
      floor <= 15 ? Rarity.RARE :
      floor <= 20 ? Rarity.EPIC :
      floor <= 25 ? Rarity.LEGENDARY :
      Rarity.MYTHIC;

    const basePower = 3 + Math.floor(floor / 3);

    const card = (i: number) =>
      new Card({
        id: `T${floor}-${i}`,
        name: `Tower ${i}`,
        basePower,
        cardClass: Object.values(CardClass)[i % 6],
        rarity,
        developments: Math.floor(floor / 5),
      });

    return new Deck([
      card(1),
      card(2),
      card(3),
      card(4),
      card(5),
      card(6),
    ]);
  }
}