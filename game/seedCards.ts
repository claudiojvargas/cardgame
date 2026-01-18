import fs from "fs";
import path from "path";
import { Card } from "./entities/Card";
import { CardClass, Rarity } from "./types/enums";
import { getRarityConfig } from "./config/rarity.config";

const OUTPUT_PATH = path.join(__dirname, "data", "cards.catalog.ts");

const RARITY_ORDER: Array<[Rarity, string]> = [
  [Rarity.COMMON, "common"],
  [Rarity.UNCOMMON, "uncommon"],
  [Rarity.RARE, "rare"],
  [Rarity.EPIC, "epic"],
  [Rarity.LEGENDARY, "legendary"],
  [Rarity.MYTHIC, "mythic"],
  [Rarity.DIAMOND, "diamond"],
];

function randomBasePower(minPower: number, maxPower: number): number {
  return Math.floor(Math.random() * (maxPower - minPower + 1)) + minPower;
}

function generateCards(): Card[] {
  return RARITY_ORDER.map(([rarity, slug]) => {
    const { minPower, maxPower, cardClass } = getRarityConfig(rarity);
    const basePower = randomBasePower(minPower, maxPower);

    return new Card({
      id: `${slug}_${cardClass}_001`,
      name: `Carta ${slug}`,
      rarity,
      cardClass,
      basePower,
      awakening: 0,
    });
  });
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

const cards = generateCards();
writeCatalog(cards);
