import { useMemo, useState } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { Card } from "../../game/entities/Card";
import { getAwakeningCost } from "../../game/systems/powerCalculator";
import { getRarityConfig } from "../../game/config/rarity.config";
import { CardTile } from "../components/CardTile";
import { useGame } from "../hooks/useGame";

export function AwakeningScreen() {
  const { profile, actions } = useGame();
  const ownedCards = useMemo(() => CARDS, []);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    null
  );

  const selectedCard = selectedCardId
    ? ownedCards.find(card => card.id === selectedCardId) ?? null
    : null;

  const awakeningLevel = selectedCardId
    ? profile.collection.awakenings[selectedCardId] ?? 0
    : 0;

  const duplicatesAvailable = selectedCardId
    ? Math.max(0, (profile.collection.inventory[selectedCardId] ?? 0) - 1)
    : 0;

  const awakeningCost = selectedCard
    ? getAwakeningCost({
        ...selectedCard,
        awakening: awakeningLevel,
      })
    : 0;

  const canAwaken =
    selectedCard &&
    duplicatesAvailable >= awakeningCost &&
    awakeningLevel <
      getRarityConfig(selectedCard.rarity).maxAwakening;

  function handleSelectCard(card: Card) {
    if ((profile.collection.inventory[card.id] ?? 0) === 0) return;
    setSelectedCardId(card.id);
  }

  function handleAwaken() {
    if (!selectedCardId || !selectedCard) return;
    if (!canAwaken) return;
    actions.removeCard(selectedCardId, awakeningCost);
    actions.setAwakening(selectedCardId, awakeningLevel + 1);
  }

  const ownedList = ownedCards.filter(card => {
    const ownedCount = profile.collection.inventory[card.id] ?? 0;
    if (ownedCount <= 1) return false;
    const currentAwakening = profile.collection.awakenings[card.id] ?? 0;
    if (currentAwakening >= getRarityConfig(card.rarity).maxAwakening) {
      return false;
    }
    const duplicatesAvailable = Math.max(0, ownedCount - 1);
    const cost = getAwakeningCost({ ...card, awakening: currentAwakening });
    return duplicatesAvailable >= cost;
  });

  return (
    <div style={{ padding: "var(--screen-padding)" }}>
      <h1>✨ Despertar</h1>
      <p>Selecione uma carta para evoluir.</p>

      <div style={{ marginBottom: "var(--space-3)" }}>
        <h2>🧪 Carta selecionada</h2>
        {selectedCard ? (
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              alignItems: "center",
            }}
          >
            <CardTile
              card={selectedCard}
              obtained
              awakeningValue={awakeningLevel}
              duplicateCount={Math.max(
                0,
                (profile.collection.inventory[selectedCard.id] ?? 0) - 1
              )}
            />
            <div>
              <p>Nível atual: {awakeningLevel}</p>
              <p>Duplicadas disponíveis: {duplicatesAvailable}</p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                }}
              >
                {Array.from({ length: awakeningCost }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: "#f7c6c6",
                      border: "1px solid #e0e0e0",
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAwaken}
                  disabled={!canAwaken}
                >
                  Despertar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: "auto",
              width: "var(--card-ui-width)",
              aspectRatio: "var(--card-ui-aspect)",
              borderRadius: 8,
              border: "1px dashed #999",
              background: "#f2f2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            Selecione
          </div>
        )}
      </div>

      <div>
        <h2>📚 Cartas obtidas</h2>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {ownedList.map(card => (
            <CardTile
              key={card.id}
              card={card}
              obtained
              isNew={profile.collection.isNew[card.id] ?? false}
              duplicateCount={Math.max(
                0,
                (profile.collection.inventory[card.id] ?? 0) - 1
              )}
              awakeningValue={profile.collection.awakenings[card.id] ?? 0}
              onClick={() => handleSelectCard(card)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
