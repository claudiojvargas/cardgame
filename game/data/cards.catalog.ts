import { Card } from "../entities/Card";
import { CardClass, Rarity } from "../types/enums";

export const CARDS: Card[] = [
  new Card({
    id: "common_attack_001",
    name: "Lamina Inicial",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 15,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_defense_001",
    name: "Muralha de Ferro",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 30,
    awakening: 0,
  }),
  new Card({
    id: "rare_support_001",
    name: "Sentinela Arcana",
    rarity: Rarity.RARE,
    cardClass: CardClass.SUPPORT,
    basePower: 50,
    awakening: 0,
  }),
  new Card({
    id: "epic_control_001",
    name: "Oraculo do Caos",
    rarity: Rarity.EPIC,
    cardClass: CardClass.CONTROL,
    basePower: 72,
    awakening: 0,
  }),
  new Card({
    id: "legendary_continuous_001",
    name: "Eterno Guardiao",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.CONTINUOUS,
    basePower: 99,
    awakening: 0,
  }),
  new Card({
    id: "mythic_strategy_001",
    name: "Conselheiro Astral",
    rarity: Rarity.MYTHIC,
    cardClass: CardClass.STRATEGY,
    basePower: 135,
    awakening: 0,
  }),
  new Card({
    id: "diamond_strategy_001",
    name: "Imperatriz Diamante",
    rarity: Rarity.DIAMOND,
    cardClass: CardClass.STRATEGY,
    basePower: 175,
    awakening: 0,
  }),
];
