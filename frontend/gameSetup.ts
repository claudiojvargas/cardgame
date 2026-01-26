import { Deck } from "../game/entities/Deck";
import { Player } from "../game/entities/Player";
import { createCardFromDefinition } from "../game/data/cardFactory";
import { CARD_DEFINITIONS } from "../game/data/cardDefinitions";
import { STARTER_DECK_IDS } from "../game/data/starterDeck";
import { ProfileRepositoryLocalStorage } from "../game/user/ProfileRepositoryLocalStorage";
import { RandomNumberGenerator, defaultRng } from "../game/utils/random";

const DECK_STORAGE_KEY = "player-deck";

function buildStarterDeckCards() {
  const cards = STARTER_DECK_IDS
    .map(id => CARD_DEFINITIONS.find(cardData => cardData.id === id))
    .filter((cardData): cardData is (typeof CARD_DEFINITIONS)[number] => Boolean(cardData))
    .map(cardData => createCardFromDefinition(cardData));

  if (cards.length === 6) {
    return cards;
  }

  return CARD_DEFINITIONS.slice(0, 6).map(cardData => createCardFromDefinition(cardData));
}

// 🔹 Deck base do jogador (fixo na run)
export function createPlayer(rng: RandomNumberGenerator = defaultRng) {
  const repository = new ProfileRepositoryLocalStorage();
  const profile = repository.load();
  const deckFromProfile = profile?.collection?.deckIds ?? [];
  const storedDeckIds = loadDeckFromStorage();
  const savedDeckIds = deckFromProfile.length > 0 ? deckFromProfile : storedDeckIds;
  const savedCards = savedDeckIds
    .map(id => CARD_DEFINITIONS.find(cardData => cardData.id === id))
    .filter((cardData): cardData is (typeof CARD_DEFINITIONS)[number] => Boolean(cardData))
    .map(cardData => createCardFromDefinition(cardData));

  const deckCards =
    savedCards.length === 6 ? savedCards : buildStarterDeckCards();

  const deck = new Deck(deckCards);

  if (profile && deckFromProfile.length === 0 && savedDeckIds.length > 0) {
    repository.save({
      ...profile,
      collection: {
        ...profile.collection,
        deckIds: savedDeckIds,
      },
    });
  }

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
