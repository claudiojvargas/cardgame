import { Card } from "./Card";
import { Deck } from "./Deck";

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
    }
  }
}
