import { ChestType, Rarity } from "../types/enums";

export interface ChestConfig {
  type: ChestType;
  name: string;
  priceGold: number;
  goldRange: [number, number];
  cardRarities: Rarity[];
  rarityRates: Array<{ rarity: Rarity; weight: number }>;
}

export const CHESTS: ChestConfig[] = [
  {
    type: ChestType.BASIC,
    name: "Caixa Básica",
    priceGold: 250,
    goldRange: [100, 150],
    cardRarities: [Rarity.UNCOMMON, Rarity.COMMON, Rarity.RARE],
    rarityRates: [
      { rarity: Rarity.COMMON, weight: 70 },
      { rarity: Rarity.UNCOMMON, weight: 25 },
      { rarity: Rarity.RARE, weight: 5 },
    ],
  },
  {
    type: ChestType.ADVANCED,
    name: "Caixa Avançada",
    priceGold: 450,
    goldRange: [175, 250],
    cardRarities: [Rarity.UNCOMMON, Rarity.COMMON, Rarity.RARE, Rarity.EPIC],
    rarityRates: [
      { rarity: Rarity.COMMON, weight: 60 },
      { rarity: Rarity.UNCOMMON, weight: 25 },
      { rarity: Rarity.RARE, weight: 12 },
      { rarity: Rarity.EPIC, weight: 3 },
    ],
  },
  {
    type: ChestType.EPIC,
    name: "Caixa Épica",
    priceGold: 600,
    goldRange: [260, 375],
    cardRarities: [Rarity.COMMON, Rarity.RARE, Rarity.EPIC],
    rarityRates: [
      { rarity: Rarity.COMMON, weight: 55 },
      { rarity: Rarity.RARE, weight: 30 },
      { rarity: Rarity.EPIC, weight: 15 },
    ],
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
    rarityRates: [
      { rarity: Rarity.COMMON, weight: 45 },
      { rarity: Rarity.RARE, weight: 30 },
      { rarity: Rarity.EPIC, weight: 20 },
      { rarity: Rarity.LEGENDARY, weight: 5 },
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
    rarityRates: [
      { rarity: Rarity.RARE, weight: 50 },
      { rarity: Rarity.EPIC, weight: 30 },
      { rarity: Rarity.LEGENDARY, weight: 15 },
      { rarity: Rarity.MYTHIC, weight: 5 },
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
    rarityRates: [
      { rarity: Rarity.EPIC, weight: 45 },
      { rarity: Rarity.LEGENDARY, weight: 30 },
      { rarity: Rarity.MYTHIC, weight: 20 },
      { rarity: Rarity.DIAMOND, weight: 5 },
    ],
  },
];
