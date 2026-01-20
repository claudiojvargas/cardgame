import { Card, Shield } from "./Card";
import { Deck } from "./Deck";
import { CardClass, Rarity } from "../types/enums";

export class Player {
  private static readonly MAX_FIELD_SIZE = 3;
  readonly id: string;
  readonly deck: Deck;
  field: Card[];
  drawPile: Card[];

  constructor(id: string, deck: Deck) {
    this.id = id;
    this.deck = deck;
    this.drawPile = this.shuffle(deck.cards.map(c => c.clone()));
    this.field = [];
    this.drawInitialHand(3);
  }

  hasLost(): boolean {
    return this.field.length === 0;
  }

  removeCard(cardId: string) {
    this.field = this.field.filter(card => card.id !== cardId);
    this.drawToField(1);
  }

  getCard(cardId: string): Card | undefined {
    return this.field.find(card => card.id === cardId);
  }

  private shuffle(cards: Card[]): Card[] {
    return [...cards].sort(() => Math.random() - 0.5);
  }

  private drawInitialHand(count: number) {
    this.drawToField(count);
  }

  private drawToField(count: number) {
    for (let i = 0; i < count; i += 1) {
      if (this.field.length >= Player.MAX_FIELD_SIZE) {
        break;
      }

      const card = this.drawPile.shift();
      if (!card) break;
      this.field.push(card);
      this.applyEnterFieldEffects(card);
    }
  }

  private applyEnterFieldEffects(card: Card) {
    switch (card.cardClass) {
      case CardClass.ATTACK:
        card.buffPowerPctTotal += 0.25;
        break;
      case CardClass.DEFENSE: {
        const allies = this.pickRandomAllies(card, 2);
        allies.forEach(ally => {
          ally.shield = buildShield("REFLECT_50");
        });
        this.rollProc(card, 0.05, () => {
          allies.forEach(ally => {
            ally.shield = buildShield("TOTAL_REFLECT_100");
          });
        });
        break;
      }
      case CardClass.SUPPORT: {
        const allies = this.pickRandomAllies(card, 2);
        allies.forEach(ally => {
          ally.hp += ally.basePower * 0.15;
        });
        this.rollProc(card, 0.05, () => {
          allies.forEach(ally => {
            ally.hp += ally.basePower * 0.35;
          });
        });
        break;
      }
      case CardClass.STRATEGY: {
        this.field.forEach(ally => {
          ally.buffPowerPctTotal += 0.2;
        });
        break;
      }
      default:
        break;
    }
  }

  private pickRandomAllies(source: Card, count: number): Card[] {
    const pool = this.field.filter(card => card.id !== source.id);
    if (pool.length <= count) {
      return pool;
    }
    return shuffleArray(pool).slice(0, count);
  }

  private rollProc(card: Card, chance: number, onProc: () => void) {
    if (!isProcEligible(card.rarity)) return;
    if (Math.random() < chance) {
      onProc();
    }
  }
}

function isProcEligible(rarity: Rarity) {
  return (
    rarity === Rarity.EPIC ||
    rarity === Rarity.LEGENDARY ||
    rarity === Rarity.MYTHIC ||
    rarity === Rarity.DIAMOND
  );
}

function shuffleArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildShield(type: Shield["type"]): Shield {
  return {
    type,
    usesLeft: 1,
    consumedOnAttack: true,
    consumedOnDamaged: true,
  };
}
