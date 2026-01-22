import { useEffect, useMemo, useState } from "react";
import { Card } from "../../game/entities/Card";
import { CARDS } from "../../game/data/cards.catalog";
import { Rarity } from "../../game/types/enums";
import { CardTile } from "../components/CardTile";
import { useGame } from "../hooks/useGame";

const MAX_DECK_SIZE = 6;
const DECK_STORAGE_KEY = "player-deck";
const RARITY_ORDER: Rarity[] = [
  Rarity.DIAMOND,
  Rarity.MYTHIC,
  Rarity.LEGENDARY,
  Rarity.EPIC,
  Rarity.RARE,
  Rarity.UNCOMMON,
  Rarity.COMMON,
];

export function CardsScreen() {
  const { profile } = useGame();
  const [deck, setDeck] = useState<Card[]>(() => {
    const storedDeck = loadDeckFromStorage()
      .map(id => CARDS.find(card => card.id === id))
      .filter((card): card is Card => Boolean(card))
      .filter(card => (profile.collection.inventory[card.id] ?? 0) > 0)
      .slice(0, MAX_DECK_SIZE);

    if (storedDeck.length > 0) {
      return storedDeck;
    }

    return CARDS.filter(card => (profile.collection.inventory[card.id] ?? 0) > 0)
      .slice(0, MAX_DECK_SIZE);
  });

  useEffect(() => {
    const deckIds = deck.map(card => card.id);
    window.localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deckIds));
  }, [deck]);

  function getAwakeningValue(cardId: string) {
    return profile.collection.awakenings[cardId] ?? 0;
  }

  function handleCardClick(card: Card) {
    if ((profile.collection.inventory[card.id] ?? 0) === 0) return;
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
            isNew={profile.collection.isNew[card.id] ?? false}
            duplicateCount={Math.max(
              0,
              (profile.collection.inventory[card.id] ?? 0) - 1
            )}
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

  const availableCards = useMemo(() => {
    const withoutDeck = CARDS.filter(
      card => !deck.some(deckCard => deckCard.id === card.id)
    );
    return [...withoutDeck].sort((left, right) => {
      const leftOwned = (profile.collection.inventory[left.id] ?? 0) > 0;
      const rightOwned = (profile.collection.inventory[right.id] ?? 0) > 0;
      if (leftOwned !== rightOwned) {
        return leftOwned ? -1 : 1;
      }
      return RARITY_ORDER.indexOf(left.rarity) - RARITY_ORDER.indexOf(right.rarity);
    });
  }, [deck, profile.collection.inventory]);

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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            maxHeight: "60vh",
            overflowY: "auto",
            paddingRight: 6,
          }}
        >
          {availableCards.map(card => (
            <CardTile
              key={card.id}
              card={card}
              obtained={(profile.collection.inventory[card.id] ?? 0) > 0}
              isNew={profile.collection.isNew[card.id] ?? false}
              duplicateCount={Math.max(
                0,
                (profile.collection.inventory[card.id] ?? 0) - 1
              )}
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
