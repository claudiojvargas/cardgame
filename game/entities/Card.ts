import { CardClass, Rarity } from "../types/enums";
import { PowerSystem } from "../systems/PowerSystem";

export interface CardProps {
  id: string;
  name: string;
  cardClass: CardClass;
  rarity: Rarity;
  basePower: number;
  developments: number; // quantos devs ativos
}

export class Card {
  readonly id: string;
  readonly name: string;
  readonly cardClass: CardClass;
  readonly rarity: Rarity;
  readonly basePower: number;
  readonly developments: number;
  power: number;

  constructor(props: CardProps) {
    this.id = props.id;
    this.name = props.name;
    this.cardClass = props.cardClass;
    this.rarity = props.rarity;
    this.basePower = props.basePower;
    this.developments = props.developments;
    this.power = this.calculateInitialPower();
  }

  private calculateInitialPower(): number {
    return PowerSystem.calculateInitialPower(this);
  }

  clone(): Card {
    return new Card({
      id: this.id,
      name: this.name,
      cardClass: this.cardClass,
      rarity: this.rarity,
      basePower: this.basePower,
      developments: this.developments,
    });
  }
}