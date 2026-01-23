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
  historia?: string;
  regiao?: string;
  effects?: CardEffectDefinition[];
}

export const CARD_DEFINITIONS: CardDefinition[] = [
  // =========================
  // COMMON (24) — basePower 10–20
  // =========================
  // ATTACK (8)
  {
    id: "common_attack_001",
    name: "Espada de Excalibur Menor",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 16,
    awakening: 0,
    historia: "Uma lâmina jovem, mas carregada de destino e honra.",
    regiao: "Inglaterra",
  },
  {
    id: "common_attack_002",
    name: "Boiúna da Várzea",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 18,
    awakening: 0,
    historia: "A serpente das águas rasas que ataca onde a lama engole a coragem.",
    regiao: "Brasil (Amazônia)",
  },
  {
    id: "common_attack_003",
    name: "Oni Aprendiz",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 15,
    awakening: 0,
    historia: "Um demônio inexperiente, mas já perigoso o bastante.",
    regiao: "Japão",
  },
  {
    id: "common_attack_004",
    name: "Guerreiro Maasai Jovem",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 14,
    awakening: 0,
    historia: "A coragem do primeiro salto e a lança que não treme.",
    regiao: "Quênia/Tanzânia",
  },
  {
    id: "common_attack_005",
    name: "Coyote Trapaceiro",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 13,
    awakening: 0,
    historia: "Ele vence não pela força, mas pela história que inventa no caminho.",
    regiao: "EUA (povos nativos)",
  },
  {
    id: "common_attack_006",
    name: "Berserker do Fiorde",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 17,
    awakening: 0,
    historia: "Um rugido, um machado, e a neve vira sangue.",
    regiao: "Noruega",
  },
  {
    id: "common_attack_007",
    name: "Saci da Rasteira",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 12,
    awakening: 0,
    historia: "Um giro de travessura e o inimigo cai antes de entender.",
    regiao: "Brasil",
  },
  {
    id: "common_attack_008",
    name: "Espírito do Kalaripayattu",
    rarity: Rarity.COMMON,
    cardClass: CardClass.ATTACK,
    basePower: 19,
    awakening: 0,
    historia: "Um golpe antigo que parece dança, mas quebra ossos.",
    regiao: "Índia (Kerala)",
  },

  // DEFENSE (6)
  {
    id: "common_defense_001",
    name: "Escudo de Hoplita",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 15,
    awakening: 0,
    historia: "Uma parede de bronze que não recua.",
    regiao: "Grécia",
  },
  {
    id: "common_defense_002",
    name: "Tartaruga A’Tui Menor",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 14,
    awakening: 0,
    historia: "A carapaça ancestral que sustenta a calma do mundo.",
    regiao: "Nova Zelândia (Maori)",
  },
  {
    id: "common_defense_003",
    name: "Anão Ferreiro Guardião",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 17,
    awakening: 0,
    historia: "Do fogo nasce a proteção — e do martelo, a promessa.",
    regiao: "Mitologia Nórdica",
  },
  {
    id: "common_defense_004",
    name: "Sentinela do Castelo Bran",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 13,
    awakening: 0,
    historia: "A torre observa… e a sombra responde.",
    regiao: "Romênia",
  },
  {
    id: "common_defense_005",
    name: "Golem de Barro Simples",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 18,
    awakening: 0,
    historia: "Um guardião silencioso moldado por mãos e intenção.",
    regiao: "Tradição Judaica",
  },
  {
    id: "common_defense_006",
    name: "Muralha de Jade",
    rarity: Rarity.COMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 16,
    awakening: 0,
    historia: "Uma defesa pura, dura como montanha e serena como lago.",
    regiao: "China",
  },

  // SUPPORT (5)
  {
    id: "common_support_001",
    name: "Curandeira Andina",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 14,
    awakening: 0,
    historia: "Ela cura com folhas, fé e vento de altitude.",
    regiao: "Peru/Bolívia (Andes)",
  },
  {
    id: "common_support_002",
    name: "Iara das Águas Calmas",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 15,
    awakening: 0,
    historia: "Um canto que fecha feridas como a água fecha ondas.",
    regiao: "Brasil",
  },
  {
    id: "common_support_003",
    name: "Xamã da Estepe",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 16,
    awakening: 0,
    historia: "O tambor ecoa e o espírito volta ao corpo.",
    regiao: "Mongólia",
  },
  {
    id: "common_support_004",
    name: "Sacerdotisa de Ísis Menor",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 18,
    awakening: 0,
    historia: "Cura antiga, escrita em ouro e oração.",
    regiao: "Egito",
  },
  {
    id: "common_support_005",
    name: "Druida do Carvalho",
    rarity: Rarity.COMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 13,
    awakening: 0,
    historia: "Onde o carvalho vive, a vida resiste.",
    regiao: "Irlanda",
  },

  // CONTROL (2)
  {
    id: "common_control_001",
    name: "Duende do Redemoinho",
    rarity: Rarity.COMMON,
    cardClass: CardClass.CONTROL,
    basePower: 12,
    awakening: 0,
    historia: "Ele não derrota — ele atrasa, confunde e some rindo.",
    regiao: "Irlanda",
  },
  {
    id: "common_control_002",
    name: "Frio do Yeti",
    rarity: Rarity.COMMON,
    cardClass: CardClass.CONTROL,
    basePower: 17,
    awakening: 0,
    historia: "O medo do gelo pesa mais que a neve.",
    regiao: "Nepal/Tibete (Himalaia)",
  },

  // CONTINUOUS (1)
  {
    id: "common_continuous_001",
    name: "Maldição do Olho Grego",
    rarity: Rarity.COMMON,
    cardClass: CardClass.CONTINUOUS,
    basePower: 16,
    awakening: 0,
    historia: "Um azar lento que corrói por dentro.",
    regiao: "Grécia/Turquia",
  },

  // EVADE (2)
  {
    id: "common_evade_001",
    name: "Kitsune Furtiva",
    rarity: Rarity.COMMON,
    cardClass: CardClass.EVADE,
    basePower: 15,
    awakening: 0,
    historia: "Uma cauda some na névoa — e o golpe já foi dado.",
    regiao: "Japão",
  },
  {
    id: "common_evade_002",
    name: "Curupira dos Passos Trocados",
    rarity: Rarity.COMMON,
    cardClass: CardClass.EVADE,
    basePower: 14,
    awakening: 0,
    historia: "Quem persegue, se perde. Quem ataca, não é visto.",
    regiao: "Brasil",
  },

  // =========================
  // UNCOMMON (18) — basePower 21–40
  // =========================
  // ATTACK (4)
  {
    id: "uncommon_attack_001",
    name: "Jaguar de Tezcatlipoca",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.ATTACK,
    basePower: 34,
    awakening: 0,
    historia: "A noite do jaguar caça com olhos de obsidiana.",
    regiao: "México (Asteca)",
  },
  {
    id: "uncommon_attack_002",
    name: "Anansi, o Contador",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.ATTACK,
    basePower: 29,
    awakening: 0,
    historia: "A teia dele é feita de histórias… e armadilhas.",
    regiao: "Gana (África Ocidental)",
  },
  {
    id: "uncommon_attack_003",
    name: "Guerreira de Mulan",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.ATTACK,
    basePower: 32,
    awakening: 0,
    historia: "Disciplina, honra e lâmina firme.",
    regiao: "China",
  },
  {
    id: "uncommon_attack_004",
    name: "Lutador Zulu",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.ATTACK,
    basePower: 27,
    awakening: 0,
    historia: "Um passo, um grito, um impacto.",
    regiao: "África do Sul",
  },

  // DEFENSE (3)
  {
    id: "uncommon_defense_001",
    name: "Escudeiro de Camelot",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 28,
    awakening: 0,
    historia: "A coragem ainda não é lenda — mas já é promessa.",
    regiao: "Inglaterra",
  },
  {
    id: "uncommon_defense_002",
    name: "Guardião Ainu",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 31,
    awakening: 0,
    historia: "Espírito protetor, firme como a tradição.",
    regiao: "Japão (Ainu)",
  },
  {
    id: "uncommon_defense_003",
    name: "Pedra de Moai Viva",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.DEFENSE,
    basePower: 36,
    awakening: 0,
    historia: "A estátua acorda — e a ilha respira.",
    regiao: "Rapa Nui (Chile)",
  },

  // SUPPORT (3)
  {
    id: "uncommon_support_001",
    name: "Mãe d’Água",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 27,
    awakening: 0,
    historia: "Onde ela passa, a dor se dissolve.",
    regiao: "Brasil",
  },
  {
    id: "uncommon_support_002",
    name: "Abençoado de Brigid",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 30,
    awakening: 0,
    historia: "A chama da santa aquece e restaura.",
    regiao: "Irlanda",
  },
  {
    id: "uncommon_support_003",
    name: "Monge do Himalaia",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.SUPPORT,
    basePower: 33,
    awakening: 0,
    historia: "Silêncio e cura em uma mesma respiração.",
    regiao: "Tibete/Nepal (Himalaia)",
  },

  // CONTROL (3)
  {
    id: "uncommon_control_001",
    name: "Banshee do Lamento",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTROL,
    basePower: 28,
    awakening: 0,
    historia: "O grito dela congela a decisão no peito.",
    regiao: "Irlanda",
  },
  {
    id: "uncommon_control_002",
    name: "Jinn do Vento Preso",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTROL,
    basePower: 35,
    awakening: 0,
    historia: "Um sopro que vira corrente e prende o inimigo.",
    regiao: "Oriente Médio",
  },
  {
    id: "uncommon_control_003",
    name: "Cuca do Berço",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTROL,
    basePower: 26,
    awakening: 0,
    historia: "O medo infantil vira arma — e ninguém se mexe.",
    regiao: "Brasil",
  },

  // CONTINUOUS (3)
  {
    id: "uncommon_continuous_001",
    name: "Areia da Múmia",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTINUOUS,
    basePower: 29,
    awakening: 0,
    historia: "Poeira antiga que nunca para de ferir.",
    regiao: "Egito",
  },
  {
    id: "uncommon_continuous_002",
    name: "Fogo de Pele (Salamandra)",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTINUOUS,
    basePower: 31,
    awakening: 0,
    historia: "Uma chama viva que queima por teimosia.",
    regiao: "Europa Medieval",
  },
  {
    id: "uncommon_continuous_003",
    name: "Chuva de Cinzas do Krakatoa",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CONTINUOUS,
    basePower: 38,
    awakening: 0,
    historia: "Quando o céu cai em cinza, a vida sangra aos poucos.",
    regiao: "Indonésia",
  },

  // EVADE (1)
  {
    id: "uncommon_evade_001",
    name: "Ninja Yokai",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.EVADE,
    basePower: 34,
    awakening: 0,
    historia: "Uma lâmina invisível que entra e sai sem resposta.",
    regiao: "Japão",
  },

  // CHAIN (1)
  {
    id: "uncommon_chain_001",
    name: "Macaco Rei — Golpe Duplo",
    rarity: Rarity.UNCOMMON,
    cardClass: CardClass.CHAIN,
    basePower: 37,
    awakening: 0,
    historia: "Ele bate uma vez… e o eco bate de novo.",
    regiao: "China",
  },

  // =========================
  // RARE (12) — basePower 41–60
  // =========================
  // ATTACK (2)
  {
    id: "rare_attack_001",
    name: "Hércules Jovem",
    rarity: Rarity.RARE,
    cardClass: CardClass.ATTACK,
    basePower: 57,
    awakening: 0,
    historia: "Força em crescimento — cada golpe parece mais pesado.",
    regiao: "Grécia",
  },
  {
    id: "rare_attack_002",
    name: "Lança de Lugh",
    rarity: Rarity.RARE,
    cardClass: CardClass.ATTACK,
    basePower: 54,
    awakening: 0,
    historia: "Uma arma que nunca erra quando a honra guia.",
    regiao: "Irlanda",
  },

  // DEFENSE (2)
  {
    id: "rare_defense_001",
    name: "Athena — Égide Menor",
    rarity: Rarity.RARE,
    cardClass: CardClass.DEFENSE,
    basePower: 52,
    awakening: 0,
    historia: "Sabedoria em forma de defesa sagrada.",
    regiao: "Grécia",
  },
  {
    id: "rare_defense_002",
    name: "Bastião do Leviatã",
    rarity: Rarity.RARE,
    cardClass: CardClass.DEFENSE,
    basePower: 60,
    awakening: 0,
    historia: "Um muro de mar profundo contra qualquer avanço.",
    regiao: "Tradições Marítimas",
  },

  // SUPPORT (2)
  {
    id: "rare_support_001",
    name: "Bastet Protetora",
    rarity: Rarity.RARE,
    cardClass: CardClass.SUPPORT,
    basePower: 49,
    awakening: 0,
    historia: "A proteção felina que cura com calma e firmeza.",
    regiao: "Egito",
  },
  {
    id: "rare_support_002",
    name: "Fada Madrinha das Trilhas",
    rarity: Rarity.RARE,
    cardClass: CardClass.SUPPORT,
    basePower: 46,
    awakening: 0,
    historia: "Uma luz pequena que devolve esperança ao viajante.",
    regiao: "França/Europa",
  },

  // CONTROL (2)
  {
    id: "rare_control_001",
    name: "Medusa — Olhar Petrificante",
    rarity: Rarity.RARE,
    cardClass: CardClass.CONTROL,
    basePower: 58,
    awakening: 0,
    historia: "Um segundo de contato… e tudo vira pedra.",
    regiao: "Grécia",
  },
  {
    id: "rare_control_002",
    name: "Frost Draugr",
    rarity: Rarity.RARE,
    cardClass: CardClass.CONTROL,
    basePower: 50,
    awakening: 0,
    historia: "Um morto de gelo que arrasta o frio para a batalha.",
    regiao: "Escandinávia",
  },

  // CONTINUOUS (2)
  {
    id: "rare_continuous_001",
    name: "Veneno de Naga",
    rarity: Rarity.RARE,
    cardClass: CardClass.CONTINUOUS,
    basePower: 55,
    awakening: 0,
    historia: "Um toque que não mata na hora — mas não perdoa.",
    regiao: "Índia/Sudeste Asiático",
  },
  {
    id: "rare_continuous_002",
    name: "Maré de Dagon",
    rarity: Rarity.RARE,
    cardClass: CardClass.CONTINUOUS,
    basePower: 53,
    awakening: 0,
    historia: "A pressão do abismo chega em ondas lentas e certas.",
    regiao: "Tradições Antigas do Mar",
  },

  // EVADE (1)
  {
    id: "rare_evade_001",
    name: "Loki Disfarçado",
    rarity: Rarity.RARE,
    cardClass: CardClass.EVADE,
    basePower: 47,
    awakening: 0,
    historia: "Ele ataca sorrindo — e ninguém sabe de onde veio.",
    regiao: "Mitologia Nórdica",
  },

  // CHAIN (1)
  {
    id: "rare_chain_001",
    name: "Hanuman — Salto do Vendaval",
    rarity: Rarity.RARE,
    cardClass: CardClass.CHAIN,
    basePower: 59,
    awakening: 0,
    historia: "Um salto, um impacto, e outro inimigo sente o mesmo vento.",
    regiao: "Índia",
  },

  // =========================
  // EPIC (8) — basePower 61–80
  // =========================
  // ATTACK (1)
  {
    id: "epic_attack_001",
    name: "Ares — Frenesi de Guerra",
    rarity: Rarity.EPIC,
    cardClass: CardClass.ATTACK,
    basePower: 76,
    awakening: 0,
    historia: "Quanto mais batalha, mais ele se alimenta do caos.",
    regiao: "Grécia",
  },

  // DEFENSE (1)
  {
    id: "epic_defense_001",
    name: "Susanoo — Muralha de Tempestade",
    rarity: Rarity.EPIC,
    cardClass: CardClass.DEFENSE,
    basePower: 74,
    awakening: 0,
    historia: "A tempestade fecha o caminho — e protege os seus.",
    regiao: "Japão",
  },

  // SUPPORT (1)
  {
    id: "epic_support_001",
    name: "Quetzalcóatl — Sopro da Vida",
    rarity: Rarity.EPIC,
    cardClass: CardClass.SUPPORT,
    basePower: 72,
    awakening: 0,
    historia: "O vento emplumado que cura e renova.",
    regiao: "México",
  },

  // CONTROL (1)
  {
    id: "epic_control_001",
    name: "Anúbis — Julgamento do Silêncio",
    rarity: Rarity.EPIC,
    cardClass: CardClass.CONTROL,
    basePower: 71,
    awakening: 0,
    historia: "Quando ele pesa a alma, até o ataque se cala.",
    regiao: "Egito",
  },

  // CONTINUOUS (2)
  {
    id: "epic_continuous_001",
    name: "Amaterasu — Chama Sagrada",
    rarity: Rarity.EPIC,
    cardClass: CardClass.CONTINUOUS,
    basePower: 78,
    awakening: 0,
    historia: "A luz do sol que queima sem pressa e sem falhar.",
    regiao: "Japão",
  },
  {
    id: "epic_continuous_002",
    name: "Kali — Dança da Ruína",
    rarity: Rarity.EPIC,
    cardClass: CardClass.CONTINUOUS,
    basePower: 79,
    awakening: 0,
    historia: "A destruição como dança: contínua, inevitável.",
    regiao: "Índia",
  },

  // EVADE (1)
  {
    id: "epic_evade_001",
    name: "Hermes — Passo Relâmpago",
    rarity: Rarity.EPIC,
    cardClass: CardClass.EVADE,
    basePower: 69,
    awakening: 0,
    historia: "Um golpe que chega antes do reflexo.",
    regiao: "Grécia",
  },

  // CHAIN (1)
  {
    id: "epic_chain_001",
    name: "Thor — Trovão em Cadeia",
    rarity: Rarity.EPIC,
    cardClass: CardClass.CHAIN,
    basePower: 77,
    awakening: 0,
    historia: "O martelo encontra um alvo… e o raio procura outro.",
    regiao: "Mitologia Nórdica",
  },

  // =========================
  // LEGENDARY (5) — basePower 81–120
  // =========================
  // ATTACK (1)
  {
    id: "legendary_attack_001",
    name: "Beowulf — Golpe do Destino",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.ATTACK,
    basePower: 110,
    awakening: 0,
    historia: "Um herói que luta como se o final já estivesse escrito.",
    regiao: "Inglaterra",
  },

  // SUPPORT (1)
  {
    id: "legendary_support_001",
    name: "Isis — Renascimento",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.SUPPORT,
    basePower: 102,
    awakening: 0,
    historia: "A cura que parece milagre — e é.",
    regiao: "Egito",
  },

  // CONTROL (1)
  {
    id: "legendary_control_001",
    name: "Baba Yaga — Pacto de Inverno",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.CONTROL,
    basePower: 106,
    awakening: 0,
    historia: "Um feitiço frio que paralisa e cobra preço.",
    regiao: "Rússia/Eslavo",
  },

  // CONTINUOUS (1)
  {
    id: "legendary_continuous_001",
    name: "Dragão Chinês — Nuvem Eterna",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.CONTINUOUS,
    basePower: 115,
    awakening: 0,
    historia: "Quando ele passa, a tempestade fica.",
    regiao: "China",
  },

  // CHAIN (1)
  {
    id: "legendary_chain_001",
    name: "Sun Wukong — Bastão dos Mil Ecos",
    rarity: Rarity.LEGENDARY,
    cardClass: CardClass.CHAIN,
    basePower: 112,
    awakening: 0,
    historia: "Um golpe vira muitos — e nenhum parece o último.",
    regiao: "China",
  },

  // =========================
  // MYTHIC (3) — basePower 121–150
  // =========================
  // CONTROL (1)
  {
    id: "mythic_control_001",
    name: "Hades — Prisão do Submundo",
    rarity: Rarity.MYTHIC,
    cardClass: CardClass.CONTROL,
    basePower: 145,
    awakening: 0,
    historia: "Correntes invisíveis que prendem até a vontade de atacar.",
    regiao: "Grécia",
  },

  // CONTINUOUS (1)
  {
    id: "mythic_continuous_001",
    name: "Jörmungandr — Veneno do Mundo",
    rarity: Rarity.MYTHIC,
    cardClass: CardClass.CONTINUOUS,
    basePower: 148,
    awakening: 0,
    historia: "O veneno dele não para — ele só aumenta.",
    regiao: "Mitologia Nórdica",
  },

  // CHAIN (1)
  {
    id: "mythic_chain_001",
    name: "Ravana — Dez Golpes",
    rarity: Rarity.MYTHIC,
    cardClass: CardClass.CHAIN,
    basePower: 142,
    awakening: 0,
    historia: "Dez faces, dez ângulos — o ataque vem em sequência.",
    regiao: "Índia (Ramayana)",
  },

  // =========================
  // DIAMOND (1) — basePower 151–200
  // =========================
  // STRATEGY (1)
  {
    id: "diamond_strategy_001",
    name: "Odin — Plano do Fim dos Tempos",
    rarity: Rarity.DIAMOND,
    cardClass: CardClass.STRATEGY,
    basePower: 185,
    awakening: 0,
    historia: "Um estrategista divino: ele vence antes do primeiro golpe.",
    regiao: "Mitologia Nórdica",
  },
];
