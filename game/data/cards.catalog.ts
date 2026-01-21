import { Card } from "../entities/Card";
import { CardClass, Rarity } from "../types/enums";

export const CARDS: Card[] = [
   // =========================
  // COMMON (24)
  // =========================
  // ATTACK (8)
  new Card({
    id: "common_attack_001",
    name: "Lamina Inicial",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 15,
    awakening: 0,
  }),
  new Card({
    id: "common_attack_002",
    name: "Corte da Recruta Rubra",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 16,
    awakening: 0,
  }),
  new Card({
    id: "common_attack_003",
    name: "Golpe da Arqueira de Cinzas",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 17,
    awakening: 0,
  }),
  new Card({
    id: "common_attack_004",
    name: "Estocada da Lanceira do Pantano",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 18,
    awakening: 0,
  }),
  new Card({
    id: "common_attack_005",
    name: "Fenda do Vento Negro",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 19,
    awakening: 0,
  }),
  new Card({
    id: "common_attack_006",
    name: "Presa da Cacadora de Ossos",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 20,
    awakening: 0,
  }),
  new Card({
    id: "common_attack_007",
    name: "Investida da Batedora Abissal",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 21,
    awakening: 0,
  }),
  new Card({
    id: "common_attack_008",
    name: "Punho da Carrasca Novata",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 22,
    awakening: 0,
  }),

  // DEFENSE (6)
  new Card({
    id: "common_defense_001",
    name: "Escudo da Catedral",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 13,
    awakening: 0,
  }),
  new Card({
    id: "common_defense_002",
    name: "Postura da Guardiã do Portao",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 14,
    awakening: 0,
  }),
  new Card({
    id: "common_defense_003",
    name: "Vigilia da Muralha",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 15,
    awakening: 0,
  }),
  new Card({
    id: "common_defense_004",
    name: "Protecao de Reliquia",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 16,
    awakening: 0,
  }),
  new Card({
    id: "common_defense_005",
    name: "Barreira da Sentinela de Ferro",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 17,
    awakening: 0,
  }),
  new Card({
    id: "common_defense_006",
    name: "Manto da Trégua",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 18,
    awakening: 0,
  }),

  // SUPPORT (5)
  new Card({
    id: "common_support_001",
    name: "Cura de Cinzas",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 14,
    awakening: 0,
  }),
  new Card({
    id: "common_support_002",
    name: "Ambar Restaurador",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 15,
    awakening: 0,
  }),
  new Card({
    id: "common_support_003",
    name: "Bencao do Véu",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 16,
    awakening: 0,
  }),
  new Card({
    id: "common_support_004",
    name: "Pocao da Aprendiz",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 17,
    awakening: 0,
  }),
  new Card({
    id: "common_support_005",
    name: "Mensagem da Ordem",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 18,
    awakening: 0,
  }),

  // CONTROL (2)
  new Card({
    id: "common_control_001",
    name: "Selo de Contencao",
    rarity: Rarity.COMMON,
    cardClass: CardClass.CONTROL,
    basePower: 15,
    awakening: 0,
  }),
  new Card({
    id: "common_control_002",
    name: "Sussurro Paralisante",
    rarity: Rarity.COMMON,
    cardClass: CardClass.CONTROL,
    basePower: 16,
    awakening: 0,
  }),

  // CONTINUOUS (1)
  new Card({
    id: "common_continuous_001",
    name: "Marca Persistente da Praga",
    rarity: Rarity.COMMON,
    cardClass: CardClass.CONTINUOUS,
    basePower: 17,
    awakening: 0,
  }),

  // EVADE (2)
  new Card({
    id: "common_evade_001",
    name: "Passo da Sombra",
    rarity: Rarity.COMMON,
    cardClass: CardClass.EVADE,
    basePower: 15,
    awakening: 0,
  }),
  new Card({
    id: "common_evade_002",
    name: "Esquiva da Peregrina",
    rarity: Rarity.COMMON,
    cardClass: CardClass.EVADE,
    basePower: 16,
    awakening: 0,
  }),

  // =========================
  // UNCOMMON (18)
  // =========================
  // ATTACK (4)
  new Card({
    id: "uncommon_attack_001",
    name: "Corte da Vingadora Rubra",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.ATTACK,
    basePower: 28,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_attack_002",
    name: "Impacto da Cacadora de Demonios",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.ATTACK,
    basePower: 30,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_attack_003",
    name: "Danca de Laminas",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.ATTACK,
    basePower: 32,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_attack_004",
    name: "Tiro da Praga",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.ATTACK,
    basePower: 34,
    awakening: 0,
  }),

  // DEFENSE (3)
  new Card({
    id: "uncommon_defense_001",
    name: "Muralha de Ferro",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 30,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_defense_002",
    name: "Escudo do Sepulcro",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 32,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_defense_003",
    name: "Juramento da Paladina",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 34,
    awakening: 0,
  }),

  // SUPPORT (3)
  new Card({
    id: "uncommon_support_001",
    name: "Uncao da Irma",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 30,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_support_002",
    name: "Sigilo Benfeitor",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 32,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_support_003",
    name: "Incenso Negro",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 34,
    awakening: 0,
  }),

  // CONTROL (3)
  new Card({
    id: "uncommon_control_001",
    name: "Medo do Véu",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTROL,
    basePower: 31,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_control_002",
    name: "Correntes da Carrasca",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTROL,
    basePower: 33,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_control_003",
    name: "Sentenca do Silencio",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTROL,
    basePower: 35,
    awakening: 0,
  }),

  // CONTINUOUS (3)
  new Card({
    id: "uncommon_continuous_001",
    name: "Selo de Cinza Ardente",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTINUOUS,
    basePower: 33,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_continuous_002",
    name: "Cantico da Praga",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTINUOUS,
    basePower: 35,
    awakening: 0,
  }),
  new Card({
    id: "uncommon_continuous_003",
    name: "Olho do Abismo",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTINUOUS,
    basePower: 37,
    awakening: 0,
  }),

  // EVADE (1)
  new Card({
    id: "uncommon_evade_001",
    name: "Passo Fantasma",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.EVADE,
    basePower: 31,
    awakening: 0,
  }),

  // CHAIN (1)
  new Card({
    id: "uncommon_chain_001",
    name: "Corrente Inicial",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CHAIN,
    basePower: 33,
    awakening: 0,
  }),

  // =========================
  // RARE (12)
  // =========================
  // ATTACK (2)
  new Card({
    id: "rare_attack_001",
    name: "Golpe da General Rubra",
    rarity: Rarity.RARE,
    cardClass: CardClass.ATTACK,
    basePower: 50,
    awakening: 0,
  }),
  new Card({
    id: "rare_attack_002",
    name: "Execucao de Hereges",
    rarity: Rarity.RARE,
    cardClass: CardClass.ATTACK,
    basePower: 55,
    awakening: 0,
  }),

  // DEFENSE (2)
  new Card({
    id: "rare_defense_001",
    name: "Halo de Aco",
    rarity: Rarity.RARE,
    cardClass: CardClass.DEFENSE,
    basePower: 50,
    awakening: 0,
  }),
  new Card({
    id: "rare_defense_002",
    name: "Juramento Inquebravel",
    rarity: Rarity.RARE,
    cardClass: CardClass.DEFENSE,
    basePower: 54,
    awakening: 0,
  }),

  // SUPPORT (2)
  new Card({
    id: "rare_support_001",
    name: "Sentinela Arcana",
    rarity: Rarity.RARE,
    cardClass: CardClass.SUPPORT,
    basePower: 50,
    awakening: 0,
  }),
  new Card({
    id: "rare_support_002",
    name: "Cura Profana",
    rarity: Rarity.RARE,
    cardClass: CardClass.SUPPORT,
    basePower: 56,
    awakening: 0,
  }),

  // CONTROL (2)
  new Card({
    id: "rare_control_001",
    name: "Grilhoes Runicos",
    rarity: Rarity.RARE,
    cardClass: CardClass.CONTROL,
    basePower: 52,
    awakening: 0,
  }),
  new Card({
    id: "rare_control_002",
    name: "Visao do Oraculo",
    rarity: Rarity.RARE,
    cardClass: CardClass.CONTROL,
    basePower: 57,
    awakening: 0,
  }),

  // CONTINUOUS (2)
  new Card({
    id: "rare_continuous_001",
    name: "Altar de Ossos",
    rarity: Rarity.RARE,
    cardClass: CardClass.CONTINUOUS,
    basePower: 58,
    awakening: 0,
  }),
  new Card({
    id: "rare_continuous_002",
    name: "Chamas da Penitencia",
    rarity: Rarity.RARE,
    cardClass: CardClass.CONTINUOUS,
    basePower: 62,
    awakening: 0,
  }),

  // EVADE (1)
  new Card({
    id: "rare_evade_001",
    name: "Evasao da Caçadora",
    rarity: Rarity.RARE,
    cardClass: CardClass.EVADE,
    basePower: 54,
    awakening: 0,
  }),

  // CHAIN (1)
  new Card({
    id: "rare_chain_001",
    name: "Corrente de Aco",
    rarity: Rarity.RARE,
    cardClass: CardClass.CHAIN,
    basePower: 56,
    awakening: 0,
  }),

  // =========================
  // EPIC (8)
  // =========================
  new Card({
    id: "epic_attack_001",
    name: "Vespera Abissal",
    rarity: Rarity.EPIC,
    cardClass: CardClass.ATTACK,
    basePower: 72,
    awakening: 0,
  }),
  new Card({
    id: "epic_defense_001",
    name: "Bastia de Ferro",
    rarity: Rarity.EPIC,
    cardClass: CardClass.DEFENSE,
    basePower: 74,
    awakening: 0,
  }),
  new Card({
    id: "epic_support_001",
    name: "Arquimedica da Praga",
    rarity: Rarity.EPIC,
    cardClass: CardClass.SUPPORT,
    basePower: 76,
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
    id: "epic_continuous_001",
    name: "Coroa de Espinhos",
    rarity: Rarity.EPIC,
    cardClass: CardClass.CONTINUOUS,
    basePower: 80,
    awakening: 0,
  }),
  new Card({
    id: "epic_continuous_002",
    name: "Nevoa da Ruina",
    rarity: Rarity.EPIC,
    cardClass: CardClass.CONTINUOUS,
    basePower: 82,
    awakening: 0,
  }),
  new Card({
    id: "epic_evade_001",
    name: "Danca da Sombra Viva",
    rarity: Rarity.EPIC,
    cardClass: CardClass.EVADE,
    basePower: 78,
    awakening: 0,
  }),
  new Card({
    id: "epic_chain_001",
    name: "Corrente do Véu",
    rarity: Rarity.EPIC,
    cardClass: CardClass.CHAIN,
    basePower: 79,
    awakening: 0,
  }),

  // =========================
  // LEGENDARY (5)
  // =========================
  new Card({
    id: "legendary_attack_001",
    name: "Dama da Execucao",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.ATTACK,
    basePower: 105,
    awakening: 0,
  }),
  new Card({
    id: "legendary_support_001",
    name: "Alta Inquisidora",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.SUPPORT,
    basePower: 102,
    awakening: 0,
  }),
  new Card({
    id: "legendary_control_001",
    name: "Rainha do Véu",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.CONTROL,
    basePower: 108,
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
    id: "legendary_chain_001",
    name: "Corrente do Cataclismo",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.CHAIN,
    basePower: 110,
    awakening: 0,
  }),

  // =========================
  // MYTHIC (3)
  // =========================
  new Card({
    id: "mythic_control_001",
    name: "Tecela do Destino",
    rarity: Rarity.MYTHIC,
    cardClass: CardClass.CONTROL,
    basePower: 135,
    awakening: 0,
  }),
  new Card({
    id: "mythic_continuous_001",
    name: "Vigilia Eterna",
    rarity: Rarity.MYTHIC,
    cardClass: CardClass.CONTINUOUS,
    basePower: 145,
    awakening: 0,
  }),
  new Card({
    id: "mythic_chain_001",
    name: "Porta do Infernum",
    rarity: Rarity.MYTHIC,
    cardClass: CardClass.CHAIN,
    basePower: 155,
    awakening: 0,
  }),

  // =========================
  // DIAMOND (1) - STRATEGY exclusivo
  // =========================
  new Card({
    id: "diamond_strategy_001",
    name: "Imperatriz Diamante",
    rarity: Rarity.DIAMOND,
    cardClass: CardClass.STRATEGY,
    basePower: 175,
    awakening: 0,
  }),

];
