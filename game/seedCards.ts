import fs from "fs";
import path from "path";
import { Card } from "./entities/Card";
import { CardClass, Rarity } from "./types/enums";
import { getRarityConfig } from "./config/rarity.config";
import { CARDS as EXISTING_CARDS } from "./data/cards.catalog";

const OUTPUT_PATH = path.join(__dirname, "data", "cards.catalog.ts");

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

function generateCards(plan: SeedPlan, existingCards: Card[]): Card[] {
  const existingIds = new Set(existingCards.map(card => card.id));
  const counts: Record<string, number> = {};

  existingCards.forEach(card => {
    const key = `${card.rarity}:${card.cardClass}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });

  const newCards: Card[] = [];

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
        const card = new Card({
          id: `${rarity}_${cardClass}_${String(nextIndex).padStart(3, "0")}`,
          name: `Carta ${rarity}-${cardClass} ${String(nextIndex).padStart(3, "0")}`,
          rarity,
          cardClass,
          basePower,
          awakening: 0,
        });

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

function serializeCard(card: Card): string {
  return `  new Card({
    id: "${card.id}",
    name: "${card.name}",
    rarity: Rarity.${getEnumKey(Rarity, card.rarity)},
    cardClass: CardClass.${getEnumKey(CardClass, card.cardClass)},
    basePower: ${card.basePower},
    awakening: ${card.awakening},
  })`;
}

function writeCatalog(cards: Card[]) {
  const contents = `import { Card } from "../entities/Card";
import { CardClass, Rarity } from "../types/enums";

export const CARDS: Card[] = [
${cards.map(serializeCard).join(",\n")},
];
`;

  fs.writeFileSync(OUTPUT_PATH, contents, "utf-8");
}

const plan = parsePlanArg();
const newCards = generateCards(plan, EXISTING_CARDS);
writeCatalog([...EXISTING_CARDS, ...newCards]);
