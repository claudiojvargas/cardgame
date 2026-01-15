import { CardClass } from "../types/enums";
import { Player } from "../entities/Player";

export interface SynergyBonus {
  attackModifier?: number;
  defenseModifier?: number;
}

export class SynergySystem {
  static calculate(player: Player): Map<CardClass, SynergyBonus> {
    const count: Record<CardClass, number> = {
      [CardClass.ATTACK]: 0,
      [CardClass.DEFENSE]: 0,
      [CardClass.SUPPORT]: 0,
      [CardClass.CONTROL]: 0,
      [CardClass.CONTINUOUS]: 0,
      [CardClass.STRATEGY]: 0,
    };

    player.field.forEach(card => {
      count[card.cardClass]++;
    });

    const bonuses = new Map<CardClass, SynergyBonus>();

    Object.entries(count).forEach(([cardClass, total]) => {
      if (total >= 2) {
        bonuses.set(cardClass as CardClass, {
          attackModifier: total === 2 ? 1 : total === 3 ? 2 : 3,
        });
      }
    });

    return bonuses;
  }
}