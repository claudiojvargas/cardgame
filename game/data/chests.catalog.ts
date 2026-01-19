import { ChestType, Rarity } from "../types/enums";

export interface ChestConfig {
  type: ChestType;
  name: string;
  priceGold: number;
  goldRange: [number, number];
  cardRarities: Rarity[];
}

export const CHESTS: ChestConfig[] = [
  {
    type: ChestType.BASIC,
    name: "Caixa Básica",
    priceGold: 250,
    goldRange: [100, 150],
    cardRarities: [Rarity.UNCOMMON, Rarity.COMMON, Rarity.RARE],
  },
  {
    type: ChestType.ADVANCED,
    name: "Caixa Avançada",
    priceGold: 450,
    goldRange: [175, 250],
    cardRarities: [Rarity.UNCOMMON, Rarity.COMMON, Rarity.RARE, Rarity.EPIC],
  },
  {
    type: ChestType.EPIC,
    name: "Caixa Épica",
    priceGold: 600,
    goldRange: [260, 375],
    cardRarities: [Rarity.COMMON, Rarity.RARE, Rarity.EPIC],
  },
  {
    type: ChestType.LEGENDARY,
    name: "Caixa Lendária",
    priceGold: 750,
    goldRange: [400, 600],
    cardRarities: [
      Rarity.COMMON,
      Rarity.RARE,
      Rarity.EPIC,
      Rarity.LEGENDARY,
    ],
  },
  {
    type: ChestType.SUPREME,
    name: "Caixa Suprema",
    priceGold: 1500,
    goldRange: [650, 950],
    cardRarities: [
      Rarity.RARE,
      Rarity.EPIC,
      Rarity.LEGENDARY,
      Rarity.MYTHIC,
    ],
  },
  {
    type: ChestType.ANCIENT,
    name: "Caixa Ancia",
    priceGold: 2500,
    goldRange: [1000, 1500],
    cardRarities: [
      Rarity.EPIC,
      Rarity.LEGENDARY,
      Rarity.MYTHIC,
      Rarity.DIAMOND,
    ],
  },
];
