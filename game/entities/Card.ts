import { CardClass, Rarity } from "../types/enums";
import { calculateCardPower } from "../systems/powerCalculator";

export interface CardProps {
  id: string;
  name: string;
  cardClass: CardClass;
  rarity: Rarity;
  basePower: number;
  awakening: number;
}

export class Card {
  readonly id: string;
  readonly name: string;
  readonly cardClass: CardClass;
  readonly rarity: Rarity;
  readonly basePower: number;
  awakening: number;
  power: number;

  constructor(props: CardProps) {
    this.id = props.id;
    this.name = props.name;
    this.cardClass = props.cardClass;
    this.rarity = props.rarity;
    this.basePower = props.basePower;
    this.awakening = props.awakening;
    this.power = this.calculateInitialPower();
  }

  private calculateInitialPower(): number {
    return calculateCardPower(this);
  }

  clone(): Card {
    return new Card({
      id: this.id,
      name: this.name,
      cardClass: this.cardClass,
      rarity: this.rarity,
      basePower: this.basePower,
      awakening: this.awakening,
    });
  }
}
