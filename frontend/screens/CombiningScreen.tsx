import { useEffect, useMemo, useState } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { Card } from "../../game/entities/Card";
import { Rarity } from "../../game/types/enums";
import {
  loadInventory,
  saveInventory,
  type PlayerInventory,
} from "../utils/inventory";

const COMBINATION_ROWS = 5;
const REQUIRED_CARDS = 4;
const GUARANTEE_THRESHOLD = 15;
const UPGRADE_CHANCE = 0.02;

const RARITY_ORDER: Rarity[] = [
  Rarity.COMMON,
  Rarity.UNCOMMON,
  Rarity.RARE,
  Rarity.EPIC,
  Rarity.LEGENDARY,
  Rarity.MYTHIC,
  Rarity.DIAMOND,
];

const INCENSE_RARITIES = new Set<Rarity>([
  Rarity.EPIC,
  Rarity.LEGENDARY,
  Rarity.MYTHIC,
  Rarity.DIAMOND,
]);

function getUpgradeTarget(rarity: Rarity): Rarity | null {
  if (rarity === Rarity.COMMON) {
    return Rarity.RARE;
  }
  const index = RARITY_ORDER.indexOf(rarity);
  if (index === -1 || index === RARITY_ORDER.length - 1) {
    return null;
  }
  return RARITY_ORDER[index + 1];
}

function buildRarityMap(cards: Card[]) {
  return cards.reduce<Record<string, Rarity>>((acc, card) => {
    acc[card.id] = card.rarity;
    return acc;
  }, {});
}

export function CombiningScreen() {
  const rarityMap = useMemo(() => buildRarityMap(CARDS), []);
  const [inventory, setInventory] = useState<PlayerInventory>(() =>
    loadInventory([])
  );
  const [rows, setRows] = useState<Array<Rarity | null>>(
    Array.from({ length: COMBINATION_ROWS }, () => null)
  );
  const [lastResult, setLastResult] = useState<{
    base: Rarity;
    result: Rarity;
    card: Card | null;
  } | null>(null);

  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  function getAvailableCount(rarity: Rarity) {
    return Object.entries(inventory.counts).reduce((sum, [id, count]) => {
      if (rarityMap[id] === rarity) {
        return sum + count;
      }
      return sum;
    }, 0);
  }

  function consumeCardsByRarity(rarity: Rarity, amount: number) {
    const nextCounts = { ...inventory.counts };
    let remaining = amount;

    Object.keys(nextCounts).forEach(cardId => {
      if (remaining <= 0) return;
      if (rarityMap[cardId] !== rarity) return;

      const available = nextCounts[cardId] ?? 0;
      if (available <= 0) return;

      const used = Math.min(available, remaining);
      nextCounts[cardId] = available - used;
      remaining -= used;
    });

    return nextCounts;
  }

  function drawRandomCard(rarity: Rarity): Card | null {
    const pool = CARDS.filter(card => card.rarity === rarity);
    if (pool.length === 0) return null;
    const card = pool[Math.floor(Math.random() * pool.length)];
    return card.clone();
  }

  function handleCombine(rowIndex: number) {
    const rarity = rows[rowIndex];
    if (!rarity) return;

    if (getAvailableCount(rarity) < REQUIRED_CARDS) return;

    const upgradeTarget = getUpgradeTarget(rarity);
    const incenseCount = inventory.incense[rarity] ?? 0;
    const hasGuarantee =
      INCENSE_RARITIES.has(rarity) && incenseCount >= GUARANTEE_THRESHOLD - 1;

    let resultRarity = rarity;
    if (upgradeTarget) {
      if (hasGuarantee || Math.random() < UPGRADE_CHANCE) {
        resultRarity = upgradeTarget;
      }
    }

    const nextCounts = consumeCardsByRarity(rarity, REQUIRED_CARDS);
    const rewardCard = drawRandomCard(resultRarity);
    if (rewardCard) {
      nextCounts[rewardCard.id] = (nextCounts[rewardCard.id] ?? 0) + 1;
    }

    const nextNewCards = new Set(inventory.newCards);
    if (rewardCard && (inventory.counts[rewardCard.id] ?? 0) === 0) {
      nextNewCards.add(rewardCard.id);
    }

    const nextIncense = { ...inventory.incense };
    if (INCENSE_RARITIES.has(rarity)) {
      if (hasGuarantee && upgradeTarget) {
        nextIncense[rarity] = 0;
      } else {
        nextIncense[rarity] = (nextIncense[rarity] ?? 0) + 1;
      }
    }

    setInventory(current => ({
      ...current,
      counts: nextCounts,
      newCards: Array.from(nextNewCards),
      incense: nextIncense,
    }));
    setLastResult({
      base: rarity,
      result: resultRarity,
      card: rewardCard,
    });
  }

  const uniformRarity = rows.every(row => row && row === rows[0])
    ? rows[0]
    : null;
  const incenseValue = uniformRarity ? inventory.incense[uniformRarity] ?? 0 : 0;

  return (
    <div style={{ padding: 20 }}>
      <h1>🔮 Combinação</h1>
      <p>Combine 4 cartas da mesma raridade para tentar evoluir.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((rarity, index) => {
          const available = rarity ? getAvailableCount(rarity) : 0;
          const disabled = !rarity || available < REQUIRED_CARDS;
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#ffffff",
                border: "1px solid #e0e0e0",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                {Array.from({ length: REQUIRED_CARDS }).map((_, slotIndex) => (
                  <div
                    key={slotIndex}
                    style={{
                      width: 50,
                      height: 70,
                      borderRadius: 8,
                      border: "1px dashed #bbb",
                      background: "#f7f7f7",
                    }}
                  />
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  {rarity ? (
                    <strong>Raridade: {rarity}</strong>
                  ) : (
                    <strong>Selecione uma raridade</strong>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {RARITY_ORDER.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setRows(current =>
                          current.map((value, idx) =>
                            idx === index ? option : value
                          )
                        )
                      }
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        background: rarity === option ? "#cfe4ff" : "#f5f5f5",
                        fontWeight: rarity === option ? "bold" : "normal",
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {rarity && (
                  <div style={{ marginTop: 8, color: "#666" }}>
                    Disponíveis: {available}
                  </div>
                )}
              </div>
              <button type="button" disabled={disabled} onClick={() => handleCombine(index)}>
                Combinar
              </button>
            </div>
          );
        })}
      </div>

      {uniformRarity && INCENSE_RARITIES.has(uniformRarity) && (
        <div style={{ marginTop: 20 }}>
          <h3>🧪 Incenso ({uniformRarity})</h3>
          <p>
            Combinações: {incenseValue} / {GUARANTEE_THRESHOLD}
          </p>
        </div>
      )}

      {lastResult && (
        <div style={{ marginTop: 20 }}>
          <h3>Resultado</h3>
          <p>
            {lastResult.base} → {lastResult.result}
          </p>
          {lastResult.card && <p>Carta recebida: {lastResult.card.name}</p>}
        </div>
      )}
    </div>
  );
}
