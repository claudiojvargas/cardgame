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

const REQUIRED_CARDS = 4;
const GUARANTEE_THRESHOLD = 15;
const DIAMOND_GUARANTEE_THRESHOLD = 100;
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
  Rarity.RARE,
  Rarity.EPIC,
  Rarity.LEGENDARY,
  Rarity.MYTHIC,
  Rarity.DIAMOND,
]);

function getGuaranteeThreshold(rarity: Rarity) {
  return rarity === Rarity.DIAMOND
    ? DIAMOND_GUARANTEE_THRESHOLD
    : GUARANTEE_THRESHOLD;
}

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

function buildCardMap(cards: Card[]) {
  return cards.reduce<Record<string, Card>>((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {});
}

export function CombiningScreen() {
  const rarityMap = useMemo(() => buildRarityMap(CARDS), []);
  const cardMap = useMemo(() => buildCardMap(CARDS), []);
  const [inventory, setInventory] = useState<PlayerInventory>(() =>
    loadInventory([])
  );
  const [selectedSlots, setSelectedSlots] = useState<Array<string | null>>(
    Array.from({ length: REQUIRED_CARDS }, () => null)
  );
  const [lastResult, setLastResult] = useState<{
    base: Rarity;
    result: Rarity;
    card: Card | null;
  } | null>(null);

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

  function getAvailableCardDuplicates(cardId: string) {
    return Math.max(0, (inventory.counts[cardId] ?? 0) - 1);
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

  const targetRarity = selectedSlots[0]
    ? rarityMap[selectedSlots[0]]
    : null;

  function handleSelectCard(card: Card) {
    const slotIndex = selectedSlots.findIndex(slot => slot === null);
    if (slotIndex === -1) return;
    if (targetRarity && card.rarity !== targetRarity) return;
    const selectedCount = selectedSlots.filter(slot => slot === card.id).length;
    if (selectedCount >= getAvailableCardDuplicates(card.id)) return;
    setSelectedSlots(current =>
      current.map((slot, idx) => (idx === slotIndex ? card.id : slot))
    );
  }

  function handleRemoveSlot(index: number) {
    if (index === 0) {
      setSelectedSlots(Array.from({ length: REQUIRED_CARDS }, () => null));
      return;
    }
    setSelectedSlots(current =>
      current.map((slot, idx) => (idx === index ? null : slot))
    );
  }

  function handleClearSlots() {
    setSelectedSlots(Array.from({ length: REQUIRED_CARDS }, () => null));
  }

  function handleAutoSelect() {
    const rarity = RARITY_ORDER.find(r => getAvailableDuplicates(r) >= REQUIRED_CARDS);
    if (!rarity) return;

    const pool = CARDS.filter(card => card.rarity === rarity);
    const nextSlots: Array<string | null> = [];
    let remaining = REQUIRED_CARDS;
    const counts = { ...inventory.counts };

    pool.forEach(card => {
      if (remaining <= 0) return;
      const available = counts[card.id] ?? 0;
      const duplicates = Math.max(0, available - 1);
      if (duplicates <= 0) return;
      const used = Math.min(duplicates, remaining);
      for (let i = 0; i < used; i += 1) {
        nextSlots.push(card.id);
      }
      remaining -= used;
    });

    setSelectedSlots(
      Array.from({ length: REQUIRED_CARDS }, (_, idx) => nextSlots[idx] ?? null)
    );
  }

  function handleCombine() {
    const selectedCards = selectedSlots
      .map(id => (id ? cardMap[id] : null))
      .filter((card): card is Card => Boolean(card));
    if (selectedCards.length !== REQUIRED_CARDS) return;

    const rarity = selectedCards[0].rarity;
    if (!selectedCards.every(card => card.rarity === rarity)) return;

    if (getAvailableDuplicates(rarity) < REQUIRED_CARDS) return;

    const upgradeTarget = getUpgradeTarget(rarity);
    const incenseCount = inventory.incense[rarity] ?? 0;
    const guaranteeThreshold = getGuaranteeThreshold(rarity);
    const hasGuarantee =
      INCENSE_RARITIES.has(rarity) && incenseCount >= guaranteeThreshold - 1;

    let resultRarity = rarity;
    let upgradedByRng = false;
    if (upgradeTarget) {
      if (hasGuarantee) {
        resultRarity = upgradeTarget;
      } else if (Math.random() < UPGRADE_CHANCE) {
        resultRarity = upgradeTarget;
        upgradedByRng = true;
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
      } else if (!upgradedByRng) {
        nextIncense[rarity] = (nextIncense[rarity] ?? 0) + 1;
      }
    }

    setInventory(current => ({
      ...current,
      counts: nextCounts,
      newCards: Array.from(nextNewCards),
      incense: nextIncense,
    }));
    setSelectedSlots(Array.from({ length: REQUIRED_CARDS }, () => null));
    setLastResult({
      base: rarity,
      result: resultRarity,
      card: rewardCard,
    });
  }

  const duplicateCards = CARDS.filter(
    card => (inventory.counts[card.id] ?? 0) > 1
  );

  const incenseList = Array.from(INCENSE_RARITIES).map(rarity => ({
    rarity,
    value: inventory.incense[rarity] ?? 0,
  }));

  const canCombine =
    selectedSlots.every(Boolean) &&
    (() => {
      const rarity = selectedSlots[0] ? rarityMap[selectedSlots[0]] : null;
      return (
        rarity &&
        selectedSlots.every(slot => slot && rarityMap[slot] === rarity)
      );
    })();

  return (
    <div style={{ padding: 20, display: "flex", gap: 16, position: "relative" }}>
      <aside style={{ width: "25%", minWidth: 220 }}>
        <h2>📦 Repetidas</h2>
        <p style={{ color: "#666" }}>
          Clique para enviar para um slot.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxHeight: "70vh",
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
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
                onClick={() => handleSelectCard(card)}
              />
            </div>
          ))}
        </div>
      </aside>

      <div style={{ flex: 1 }}>
        <h1>🔮 Combinação</h1>
        <p>Combine 4 cartas da mesma raridade para tentar evoluir.</p>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <button type="button" onClick={handleAutoSelect}>
            Selecionar automático
          </button>
          <button type="button" onClick={handleClearSlots}>
            Limpar
          </button>
          <button type="button" onClick={handleCombine} disabled={!canCombine}>
            Combinar
          </button>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {selectedSlots.map((slot, index) => (
            <div key={index}>
              {slot ? (
                <CardTile
                  card={cardMap[slot]}
                  obtained
                  onClick={() => handleRemoveSlot(index)}
                />
              ) : (
                <div
                  style={{
                    height: 200,
                    width: 140,
                    borderRadius: 8,
                    border: "1px dashed #bbb",
                    background: "#f7f7f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#777",
                  }}
                >
                  {index === 0 || targetRarity ? "Slot vazio" : "Slot inicial"}
                </div>
              )}
            </div>
          ))}
        </div>

        {lastResult && (
          <div style={{ marginTop: 20 }}>
            <h3>Resultado</h3>
            <p>
              {lastResult.base} → {lastResult.result}
            </p>
            {lastResult.card && (
              <CardTile card={lastResult.card} obtained />
            )}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: 12,
          padding: 12,
          minWidth: 180,
        }}
      >
        <strong>🧪 Incenso</strong>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {incenseList.map(item => (
            <div key={item.rarity}>
              {item.rarity}: {item.value}/{getGuaranteeThreshold(item.rarity)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
