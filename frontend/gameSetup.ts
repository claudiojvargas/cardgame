import { Card } from "../game/entities/Card";
import { Deck } from "../game/entities/Deck";
import { Player } from "../game/entities/Player";
import { CardClass, Rarity } from "../game/types/enums";
import { CARDS } from "../game/data/cards.catalog";
import { RandomNumberGenerator, defaultRng } from "../game/utils/random";

const DECK_STORAGE_KEY = "player-deck";

// Helper para criar carta
const card = (
  id: string,
  power: number,
  cls: CardClass,
  rarity: Rarity
) =>
  new Card({
    id,
    name: id,
    basePower: power,
    cardClass: cls,
    rarity,
    awakening: 0,
    historia: "Desconhecida",
    regiao: "Desconhecida",
  });

// 🔹 Deck base do jogador (fixo na run)
export function createPlayer(rng: RandomNumberGenerator = defaultRng) {
  const savedDeckIds = loadDeckFromStorage();
  const savedCards = savedDeckIds
    .map(id => CARDS.find(cardData => cardData.id === id))
    .filter((cardData): cardData is Card => Boolean(cardData))
    .map(cardData => cardData.clone());

  const deck = new Deck(
    savedCards.length === 6
      ? savedCards
      : [
          card("P1", 5, CardClass.ATTACK, Rarity.COMMON),
          card("P2", 6, CardClass.DEFENSE, Rarity.UNCOMMON),
          card("P3", 4, CardClass.CONTROL, Rarity.COMMON),
          card("P4", 3, CardClass.SUPPORT, Rarity.COMMON),
          card("P5", 5, CardClass.ATTACK, Rarity.RARE),
          card("P6", 4, CardClass.STRATEGY, Rarity.COMMON),
        ]
  );

  return new Player("Player", deck, rng);
}

function loadDeckFromStorage(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(DECK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}
