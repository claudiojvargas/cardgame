import { useMemo, useState } from "react";
import { Card } from "../../game/entities/Card";
import { CARDS } from "../../game/data/cards.catalog";
import { CardTile } from "../components/CardTile";

const MAX_DECK_SIZE = 6;

function getInitialOwnedIds() {
  return new Set<string>([
    "common_attack_001",
    "uncommon_defense_001",
    "rare_support_001",
  ]);
}

export function CardsScreen() {
  const ownedIds = useMemo(() => getInitialOwnedIds(), []);
  const [deck, setDeck] = useState<Card[]>(() =>
    CARDS.filter(card => ownedIds.has(card.id)).slice(0, MAX_DECK_SIZE)
  );
  const [pendingCardId, setPendingCardId] = useState<string | null>(
    null
  );

  const pendingCard = pendingCardId
    ? CARDS.find(card => card.id === pendingCardId) ?? null
    : null;

  function handleCardClick(card: Card) {
    if (!ownedIds.has(card.id)) return;
    if (deck.some(deckCard => deckCard.id === card.id)) return;

    if (deck.length < MAX_DECK_SIZE) {
      setDeck(current => [...current, card]);
      return;
    }

    setPendingCardId(card.id);
  }

  function handleDeckCardClick(card: Card, index: number) {
    if (!pendingCard) return;

    setDeck(current =>
      current.map((deckCard, deckIndex) =>
        deckIndex === index ? pendingCard : deckCard
      )
    );
    setPendingCardId(null);
  }

  const deckSlots = Array.from({ length: MAX_DECK_SIZE }, (_, index) => {
    const card = deck[index];
    return (
      <div key={card ? card.id : `slot-${index}`}>
        {card ? (
          <CardTile
            card={card}
            obtained
            onClick={() => handleDeckCardClick(card, index)}
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
          {pendingCard
            ? `Deck cheio! Selecione uma carta para substituir por ${pendingCard.name}.`
            : "Clique em uma carta obtida para adicioná-la ao deck."}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" }}>{deckSlots}</div>
      </section>

      <section>
        <h2>📚 Todas as cartas</h2>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {CARDS.map(card => (
            <CardTile
              key={card.id}
              card={card}
              obtained={ownedIds.has(card.id)}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
