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

export type ShieldType = "REFLECT_50" | "TOTAL_REFLECT_100";

export interface Shield {
  type: ShieldType;
  usesLeft: number;
  consumedOnAttack: boolean;
  consumedOnDamaged: boolean;
}

export interface DotEffect {
  roundsLeft: number;
  tickDamage: number;
  sourceId: string;
  type: "DOT";
}

export type StatusEffect =
  | {
      type: "FROZEN";
      roundsLeft: number;
    }
  | ({
      type: "DOT";
    } & DotEffect)
  | {
      type: "SHIELD";
      shield: Shield;
    };

export class Card {
  readonly id: string;
  readonly name: string;
  readonly cardClass: CardClass;
  readonly rarity: Rarity;
  readonly basePower: number;
  awakening: number;
  power: number;
  buffPowerPctTotal: number;
  hp: number;
  statusEffects: StatusEffect[];

  constructor(props: CardProps) {
    this.id = props.id;
    this.name = props.name;
    this.cardClass = props.cardClass;
    this.rarity = props.rarity;
    this.basePower = props.basePower;
    this.awakening = props.awakening;
    this.power = this.calculateInitialPower();
    this.buffPowerPctTotal = 0;
    this.hp = this.power;
    this.statusEffects = [];
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
