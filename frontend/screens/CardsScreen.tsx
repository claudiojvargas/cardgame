import { CSSProperties, useEffect, useMemo, useState } from "react";
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
  const { profile, actions } = useGame();
  const [deck, setDeck] = useState<Card[]>(() => {
    const initialDeckIds =
      profile.collection.deckIds.length > 0
        ? profile.collection.deckIds
        : loadDeckFromStorage();

    const storedDeck = initialDeckIds
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
    actions.setDeckIds(deckIds);
  }, [actions, deck]);

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
              height: "auto",
              width: "var(--card-ui-width)",
              aspectRatio: "var(--card-ui-aspect)",
              margin: "var(--card-ui-margin, var(--space-1))",
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
    return withoutDeck
      .filter(card => (profile.collection.inventory[card.id] ?? 0) > 0)
      .sort(
        (left, right) => RARITY_ORDER.indexOf(left.rarity) - RARITY_ORDER.indexOf(right.rarity)
      );
  }, [deck, profile.collection.inventory]);

  return (
    <div
      style={{
        padding: "var(--screen-padding)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <section>
        <h1>🃏 Meu Deck</h1>
        <p>
          {deck.length >= MAX_DECK_SIZE
            ? "Deck cheio! Remova uma carta para adicionar outra."
            : "Clique em uma carta obtida para adicioná-la ao deck. Clique no deck para remover."}
        </p>
        <div
          style={
            {
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "var(--space-2)",
              "--card-ui-width": "100%",
              "--card-ui-margin": "0px",
            } as CSSProperties
          }
        >
          {deckSlots}
        </div>
      </section>

      <section>
        <h2>📚 Todas as cartas</h2>
        <div
          style={
            {
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "var(--space-2)",
              maxHeight: "60vh",
              overflowY: "auto",
              paddingRight: "var(--space-1)",
              "--card-ui-width": "100%",
              "--card-ui-margin": "0px",
            } as CSSProperties
          }
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
