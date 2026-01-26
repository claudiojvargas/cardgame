import fs from "fs";
import path from "path";
import { CardClass, Rarity } from "./types/enums";
import { getRarityConfig } from "./config/rarity.config";
import type { CardEffectDefinition, CardDefinition } from "./data/cardDefinitions";
import { CARD_DEFINITIONS } from "./data/cardDefinitions";

const OUTPUT_PATH = path.join(__dirname, "data", "cardDefinitions.ts");

type SeedPlan = Record<Rarity, Partial<Record<CardClass, number>>>;

const DEFAULT_PLAN: SeedPlan = {
  [Rarity.COMMON]: { [CardClass.ATTACK]: 1 },
  [Rarity.UNCOMMON]: { [CardClass.DEFENSE]: 1 },
  [Rarity.RARE]: { [CardClass.SUPPORT]: 1 },
  [Rarity.EPIC]: { [CardClass.CONTROL]: 1 },
  [Rarity.LEGENDARY]: { [CardClass.CONTINUOUS]: 1 },
  [Rarity.MYTHIC]: { [CardClass.STRATEGY]: 1 },
  [Rarity.DIAMOND]: { [CardClass.STRATEGY]: 1 },
};

function randomBasePower(minPower: number, maxPower: number): number {
  return Math.floor(Math.random() * (maxPower - minPower + 1)) + minPower;
}

function parsePlanArg(): SeedPlan {
  const planArgIndex = process.argv.findIndex(arg => arg === "--plan");
  if (planArgIndex === -1) {
    return DEFAULT_PLAN;
  }

  const rawPlan = process.argv[planArgIndex + 1];
  if (!rawPlan) {
    return DEFAULT_PLAN;
  }

  try {
    return JSON.parse(rawPlan) as SeedPlan;
  } catch {
    return DEFAULT_PLAN;
  }
}

function isRarity(value: string): value is Rarity {
  return Object.values(Rarity).includes(value as Rarity);
}

function isCardClass(value: string): value is CardClass {
  return Object.values(CardClass).includes(value as CardClass);
}

function getNextIndex(existingIds: Set<string>, rarity: Rarity, cardClass: CardClass): number {
  const prefix = `${rarity}_${cardClass}_`;
  let maxIndex = 0;

  existingIds.forEach(id => {
    if (!id.startsWith(prefix)) return;
    const suffix = id.slice(prefix.length);
    const parsed = Number.parseInt(suffix, 10);
    if (!Number.isNaN(parsed)) {
      maxIndex = Math.max(maxIndex, parsed);
    }
  });

  return maxIndex + 1;
}

function generateCards(plan: SeedPlan, existingCards: CardDefinition[]): CardDefinition[] {
  const existingIds = new Set(existingCards.map(card => card.id));
  const counts: Record<string, number> = {};

  existingCards.forEach(card => {
    const key = `${card.rarity}:${card.cardClass}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });

  const newCards: CardDefinition[] = [];

  Object.entries(plan).forEach(([rarityKey, classes]) => {
    if (!isRarity(rarityKey)) {
      return;
    }

    const rarity = rarityKey;
    const { minPower, maxPower } = getRarityConfig(rarity);

    Object.entries(classes ?? {}).forEach(([classKey, targetCount]) => {
      if (!isCardClass(classKey)) {
        return;
      }

      const cardClass = classKey;
      const key = `${rarity}:${cardClass}`;
      const existingCount = counts[key] ?? 0;
      const missing = Math.max(0, (targetCount ?? 0) - existingCount);

      let nextIndex = getNextIndex(existingIds, rarity, cardClass);

      for (let i = 0; i < missing; i += 1) {
        const basePower = randomBasePower(minPower, maxPower);
        const card: CardDefinition = {
          id: `${rarity}_${cardClass}_${String(nextIndex).padStart(3, "0")}`,
          name: `Carta ${rarity}-${cardClass} ${String(nextIndex).padStart(3, "0")}`,
          rarity,
          cardClass,
          basePower,
          awakening: 0,
          historia: "Desconhecida",
          regiao: "Desconhecida",
        };

        existingIds.add(card.id);
        newCards.push(card);
        nextIndex += 1;
      }
    });
  });

  return newCards;
}

function getEnumKey<T extends Record<string, string>>(
  enumObj: T,
  value: T[keyof T]
): string {
  const match = Object.entries(enumObj).find(([, enumValue]) => enumValue === value);
  return match ? match[0] : String(value);
}

function escapeString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function serializeCardEffect(effect: CardEffectDefinition): string {
  const lines = [
    "      {",
    `        id: "${escapeString(effect.id)}",`,
    `        kind: "${escapeString(effect.kind)}",`,
  ];

  if (typeof effect.chance === "number") {
    lines.push(`        chance: ${effect.chance},`);
  }

  if (typeof effect.value === "number") {
    lines.push(`        value: ${effect.value},`);
  }

  lines.push("      }");
  return lines.join("\n");
}

function serializeCard(card: CardDefinition): string {
  const lines = [
    "  {",
    `    id: "${escapeString(card.id)}",`,
    `    name: "${escapeString(card.name)}",`,
    `    rarity: Rarity.${getEnumKey(Rarity, card.rarity)},`,
    `    cardClass: CardClass.${getEnumKey(CardClass, card.cardClass)},`,
    `    basePower: ${card.basePower},`,
    `    awakening: ${card.awakening},`,
  ];

  if (card.historia) {
    lines.push(`    historia: "${escapeString(card.historia)}",`);
  }

  if (card.regiao) {
    lines.push(`    regiao: "${escapeString(card.regiao)}",`);
  }

  if (card.effects?.length) {
    lines.push("    effects: [");
    lines.push(card.effects.map(serializeCardEffect).join(",\n"));
    lines.push("    ],");
  }

  lines.push("  }");
  return lines.join("\n");
}

function writeCatalog(cards: CardDefinition[]) {
  const contents = `import { CardClass, Rarity } from "../types/enums";

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
${cards.map(serializeCard).join(",\n")},
];
`;

  fs.writeFileSync(OUTPUT_PATH, contents, "utf-8");
}

const plan = parsePlanArg();
const newCards = generateCards(plan, CARD_DEFINITIONS);
writeCatalog([...CARD_DEFINITIONS, ...newCards]);
