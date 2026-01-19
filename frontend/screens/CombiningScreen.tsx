import { useEffect, useMemo, useState } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { Card } from "../../game/entities/Card";
import { Rarity } from "../../game/types/enums";
import { CardTile } from "../components/CardTile";
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
  const [lastResults, setLastResults] = useState<
    Record<number, { base: Rarity; result: Rarity; card: Card | null }>
  >({});

  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  function getAvailableDuplicates(rarity: Rarity) {
    return Object.entries(inventory.counts).reduce((sum, [id, count]) => {
      if (rarityMap[id] === rarity) {
        return sum + Math.max(0, count - 1);
      }
      return sum;
    }, 0);
  }

  function consumeDuplicatesByRarity(rarity: Rarity, amount: number) {
    const nextCounts = { ...inventory.counts };
    let remaining = amount;

    Object.keys(nextCounts).forEach(cardId => {
      if (remaining <= 0) return;
      if (rarityMap[cardId] !== rarity) return;

      const available = nextCounts[cardId] ?? 0;
      const duplicates = Math.max(0, available - 1);
      if (duplicates <= 0) return;

      const used = Math.min(duplicates, remaining);
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

  function handleCombine(rowIndex: number, rarity: Rarity) {
    if (getAvailableDuplicates(rarity) < REQUIRED_CARDS) return;

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

    const nextCounts = consumeDuplicatesByRarity(rarity, REQUIRED_CARDS);
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
    setLastResults(current => ({
      ...current,
      [rowIndex]: {
        base: rarity,
        result: resultRarity,
        card: rewardCard,
      },
    }));
  }

  const availableRarities = RARITY_ORDER.filter(
    rarity => getAvailableDuplicates(rarity) >= REQUIRED_CARDS
  );
  const rows = Array.from({ length: COMBINATION_ROWS }, (_, index) =>
    availableRarities[index] ?? null
  );
  const activeRarities = rows.filter((row): row is Rarity => Boolean(row));
  const uniformRarity =
    activeRarities.length > 0 &&
    activeRarities.every(rarity => rarity === activeRarities[0])
      ? activeRarities[0]
      : null;
  const incenseValue = uniformRarity ? inventory.incense[uniformRarity] ?? 0 : 0;

  const duplicateCards = CARDS.filter(
    card => (inventory.counts[card.id] ?? 0) > 1
  );

  function handleCombineAll() {
    rows.forEach((rarity, index) => {
      if (!rarity) return;
      handleCombine(index, rarity);
    });
  }

  return (
    <div style={{ padding: 20, display: "flex", gap: 16 }}>
      <aside style={{ width: "25%", minWidth: 220 }}>
        <h2>📦 Repetidas</h2>
        <p style={{ color: "#666" }}>
          Disponíveis para combinação automática.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {duplicateCards.length === 0 && (
            <div
              style={{
                border: "1px dashed #bbb",
                borderRadius: 12,
                padding: 12,
                background: "#f7f7f7",
                color: "#777",
              }}
            >
              Sem cartas repetidas.
            </div>
          )}
          {duplicateCards.map(card => (
            <div key={card.id}>
              <CardTile
                card={card}
                obtained
                duplicateCount={Math.max(
                  0,
                  (inventory.counts[card.id] ?? 0) - 1
                )}
              />
            </div>
          ))}
        </div>
      </aside>

      <div style={{ flex: 1 }}>
        <h1>🔮 Combinação</h1>
        <p>Combine 4 cartas da mesma raridade para tentar evoluir.</p>
        <button
          type="button"
          onClick={handleCombineAll}
          style={{ marginBottom: 12 }}
          disabled={rows.every(row => !row)}
        >
          Combinar tudo
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((rarity, index) => {
            const available = rarity ? getAvailableDuplicates(rarity) : 0;
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
                      <strong>Sem combinações disponíveis</strong>
                    )}
                  </div>
                  {rarity && (
                    <div style={{ marginTop: 8, color: "#666" }}>
                      Duplicadas disponíveis: {available}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleCombine(index, rarity ?? Rarity.COMMON)}
                  >
                    Combinar
                  </button>
                </div>
                <div style={{ width: 160 }}>
                  {lastResults[index]?.card && (
                    <CardTile
                      card={lastResults[index].card as Card}
                      obtained
                      duplicateCount={Math.max(
                        0,
                        (inventory.counts[lastResults[index].card!.id] ?? 0) - 1
                      )}
                    />
                  )}
                </div>
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

        {rows.every(row => !row) && (
          <div style={{ marginTop: 20, color: "#666" }}>
            Você não possui duplicadas suficientes para combinar.
          </div>
        )}
      </div>
    </div>
  );
}
