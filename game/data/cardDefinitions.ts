import { CardClass, Rarity } from "../types/enums";

export type CardEffectDefinition = {
  id: string;
  kind: string;
  chance?: number;
  value?: number;
};

export interface CardDefinition {
  id: string;
  name: string;
  rarity: Rarity;
  cardClass: CardClass;
  basePower: number;
  awakening: number;
  effects?: CardEffectDefinition[];
}

export const CARD_DEFINITIONS: CardDefinition[] = [
  {
    id: "common_attack_001",
    name: "Lamina Inicial",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 15,
    awakening: 0,
    effects: [{ id: "attack_team_buff", kind: "ATTACK_TEAM_BUFF", chance: 0.05 }],
  },
  {
    id: "uncommon_defense_001",
    name: "Muralha de Ferro",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 30,
    awakening: 0,
    effects: [{ id: "defense_team_shield", kind: "DEFENSE_SHIELD_TEAM", chance: 0.05 }],
  },
  {
    id: "rare_support_001",
    name: "Sentinela Arcana",
    rarity: Rarity.RARE,
    cardClass: CardClass.SUPPORT,
    basePower: 50,
    awakening: 0,
  },
  {
    id: "epic_control_001",
    name: "Oraculo do Caos",
    rarity: Rarity.EPIC,
    cardClass: CardClass.CONTROL,
    basePower: 72,
    awakening: 0,
    effects: [{ id: "control_freeze", kind: "CONTROL_FREEZE_CHAIN", chance: 0.05 }],
  },
  {
    id: "legendary_continuous_001",
    name: "Eterno Guardiao",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.CONTINUOUS,
    basePower: 99,
    awakening: 0,
    effects: [{ id: "continuous_dot", kind: "CONTINUOUS_DOT", chance: 0.05 }],
  },
  {
    id: "mythic_strategy_001",
    name: "Conselheiro Astral",
    rarity: Rarity.MYTHIC,
    cardClass: CardClass.STRATEGY,
    basePower: 135,
    awakening: 0,
    effects: [{ id: "strategy_team_shield", kind: "STRATEGY_SHIELD_TEAM", chance: 0.1 }],
  },
  {
    id: "diamond_strategy_001",
    name: "Imperatriz Diamante",
    rarity: Rarity.DIAMOND,
    cardClass: CardClass.STRATEGY,
    basePower: 175,
    awakening: 0,
    effects: [{ id: "strategy_team_shield", kind: "STRATEGY_SHIELD_TEAM", chance: 0.1 }],
  },
];
