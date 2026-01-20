import { useEffect, useMemo, useState } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { Card } from "../../game/entities/Card";
import { getAwakeningCost } from "../../game/systems/powerCalculator";
import { getRarityConfig } from "../../game/config/rarity.config";
import { CardTile } from "../components/CardTile";
import {
  loadInventory,
  saveInventory,
  type PlayerInventory,
} from "../utils/inventory";

export function AwakeningScreen() {
  const ownedCards = useMemo(() => CARDS, []);
  const [inventory, setInventory] = useState<PlayerInventory>(() =>
    loadInventory([])
  );
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    null
  );

  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  const selectedCard = selectedCardId
    ? ownedCards.find(card => card.id === selectedCardId) ?? null
    : null;

  const awakeningLevel = selectedCardId
    ? inventory.awakenings[selectedCardId] ?? 0
    : 0;

  const duplicatesAvailable = selectedCardId
    ? Math.max(0, (inventory.counts[selectedCardId] ?? 0) - 1)
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
    if ((inventory.counts[card.id] ?? 0) === 0) return;
    setSelectedCardId(card.id);
  }

  function handleAwaken() {
    if (!selectedCardId || !selectedCard) return;
    if (!canAwaken) return;

    setInventory(current => {
      const nextCounts = { ...current.counts };
      const nextAwakenings = { ...current.awakenings };

      nextCounts[selectedCardId] = Math.max(
        0,
        (nextCounts[selectedCardId] ?? 0) - awakeningCost
      );
      nextAwakenings[selectedCardId] =
        (nextAwakenings[selectedCardId] ?? 0) + 1;

      return {
        ...current,
        counts: nextCounts,
        awakenings: nextAwakenings,
      };
    });
  }

  const ownedList = ownedCards.filter(card => {
    const ownedCount = inventory.counts[card.id] ?? 0;
    if (ownedCount <= 1) return false;
    const currentAwakening = inventory.awakenings[card.id] ?? 0;
    if (currentAwakening >= getRarityConfig(card.rarity).maxAwakening) {
      return false;
    }
    const duplicatesAvailable = Math.max(0, ownedCount - 1);
    const cost = getAwakeningCost({ ...card, awakening: currentAwakening });
    return duplicatesAvailable >= cost;
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>✨ Despertar</h1>
      <p>Selecione uma carta para evoluir.</p>

      <div style={{ marginBottom: 20 }}>
        <h2>🧪 Carta selecionada</h2>
        {selectedCard ? (
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <CardTile
              card={selectedCard}
              obtained
              awakeningValue={awakeningLevel}
              duplicateCount={Math.max(
                0,
                (inventory.counts[selectedCard.id] ?? 0) - 1
              )}
            />
            <div>
              <p>Nível atual: {awakeningLevel}</p>
              <p>Duplicadas disponíveis: {duplicatesAvailable}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {Array.from({ length: awakeningCost }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
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
              height: 200,
              width: 140,
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
              isNew={inventory.newCards.includes(card.id)}
              duplicateCount={Math.max(
                0,
                (inventory.counts[card.id] ?? 0) - 1
              )}
              awakeningValue={inventory.awakenings[card.id] ?? 0}
              onClick={() => handleSelectCard(card)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
