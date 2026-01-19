import { useEffect, useMemo, useState } from "react";
import { Card } from "../../game/entities/Card";
import { CARDS } from "../../game/data/cards.catalog";
import { CardTile } from "../components/CardTile";
import {
  loadInventory,
  saveInventory,
  type PlayerInventory,
} from "../utils/inventory";

const MAX_DECK_SIZE = 6;
const DECK_STORAGE_KEY = "player-deck";

function getInitialOwnedIds() {
  return new Set<string>([
    "common_attack_001",
    "uncommon_defense_001",
    "rare_support_001",
  ]);
}

export function CardsScreen() {
  const ownedIds = useMemo(() => getInitialOwnedIds(), []);
  const [inventory, setInventory] = useState<PlayerInventory>(() =>
    loadInventory(CARDS.filter(card => ownedIds.has(card.id)))
  );
  const [deck, setDeck] = useState<Card[]>(() => {
    const storedDeck = loadDeckFromStorage()
      .map(id => CARDS.find(card => card.id === id))
      .filter((card): card is Card => Boolean(card))
      .filter(card => (inventory.counts[card.id] ?? 0) > 0)
      .slice(0, MAX_DECK_SIZE);

    if (storedDeck.length > 0) {
      return storedDeck;
    }

    return CARDS.filter(card => (inventory.counts[card.id] ?? 0) > 0).slice(
      0,
      MAX_DECK_SIZE
    );
  });

  useEffect(() => {
    const deckIds = deck.map(card => card.id);
    window.localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deckIds));
  }, [deck]);

  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  function getAwakeningValue(cardId: string) {
    return inventory.awakenings[cardId] ?? 0;
  }

  function handleCardClick(card: Card) {
    if ((inventory.counts[card.id] ?? 0) === 0) return;
    if (deck.some(deckCard => deckCard.id === card.id)) return;

    if (deck.length >= MAX_DECK_SIZE) {
      return;
    }

    setDeck(current => [...current, card]);
  }

  function handleDeckCardClick(card: Card) {
    setDeck(current => current.filter(deckCard => deckCard.id !== card.id));
  }

  const deckSlots = Array.from({ length: MAX_DECK_SIZE }, (_, index) => {
    const card = deck[index];
    return (
      <div key={card ? card.id : `slot-${index}`}>
        {card ? (
          <CardTile
            card={card}
            obtained
            isNew={inventory.newCards.includes(card.id)}
            duplicateCount={Math.max(0, (inventory.counts[card.id] ?? 0) - 1)}
            awakeningValue={getAwakeningValue(card.id)}
            onClick={() => handleDeckCardClick(card)}
          />
        ) : (
          <div
            style={{
              height: 200,
              width: 140,
              margin: 6,
              borderRadius: 8,
              border: "1px dashed #999",
              background: "#f2f2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            Vazio
          </div>
        )}
      </div>
    );
  });

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
      <section>
        <h1>🃏 Meu Deck</h1>
        <p>
          {deck.length >= MAX_DECK_SIZE
            ? "Deck cheio! Remova uma carta para adicionar outra."
            : "Clique em uma carta obtida para adicioná-la ao deck. Clique no deck para remover."}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" }}>{deckSlots}</div>
      </section>

      <section>
        <h2>📚 Todas as cartas</h2>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {CARDS.filter(card => !deck.some(deckCard => deckCard.id === card.id)).map(card => (
            <CardTile
              key={card.id}
              card={card}
              obtained={(inventory.counts[card.id] ?? 0) > 0}
              isNew={inventory.newCards.includes(card.id)}
              duplicateCount={Math.max(0, (inventory.counts[card.id] ?? 0) - 1)}
              awakeningValue={getAwakeningValue(card.id)}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      </section>
    </div>
  );
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
