import { Card } from "./Card";

export class Deck {
  readonly cards: Card[];

  constructor(cards: Card[]) {
    if (cards.length !== 6) {
      throw new Error("Deck must have exactly 6 cards");
    }

    const ids = cards.map(c => c.id);
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
      throw new Error("Deck cannot contain duplicate cards");
    }

    this.cards = cards.map(c => c.clone());
  }

  getTotalPower(): number {
    return this.cards.reduce((sum, card) => sum + card.power, 0);
  }
}
