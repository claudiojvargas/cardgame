import { Card } from "./Card";
import { Deck } from "./Deck";

export class Player {
  readonly id: string;
  readonly deck: Deck;
  field: Card[];

  constructor(id: string, deck: Deck) {
    this.id = id;
    this.deck = deck;
    this.field = deck.cards.map(c => c.clone());
  }

  hasLost(): boolean {
    return this.field.length === 0;
  }

  removeCard(cardId: string) {
    this.field = this.field.filter(card => card.id !== cardId);
  }

  getCard(cardId: string): Card | undefined {
    return this.field.find(card => card.id === cardId);
  }
}