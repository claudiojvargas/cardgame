import { useMemo, useState } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { Card } from "../../game/entities/Card";
import { Rarity } from "../../game/types/enums";
import { CardTile } from "../components/CardTile";
import { useGame } from "../hooks/useGame";

const REQUIRED_CARDS = 4;
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
  const { profile, actions, getIncenseThreshold } = useGame();
  const rarityMap = useMemo(() => buildRarityMap(CARDS), []);
  const cardMap = useMemo(() => buildCardMap(CARDS), []);
  const [selectedSlots, setSelectedSlots] = useState<Array<string | null>>(
    Array.from({ length: REQUIRED_CARDS }, () => null)
  );
  const [lastResult, setLastResult] = useState<{
    base: Rarity;
    result: Rarity;
    card: Card | null;
  } | null>(null);

  function getAvailableDuplicates(rarity: Rarity) {
    return Object.entries(profile.collection.inventory).reduce((sum, [id, count]) => {
      if (rarityMap[id] === rarity) {
        return sum + Math.max(0, count - 1);
      }
      return sum;
    }, 0);
  }

  function getAvailableCardDuplicates(cardId: string) {
    return Math.max(0, (profile.collection.inventory[cardId] ?? 0) - 1);
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
    const counts = { ...profile.collection.inventory };

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
    const incenseCount = profile.stats.incense[rarity] ?? 0;
    const guaranteeThreshold = getIncenseThreshold(rarity);
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

    const rewardCard = drawRandomCard(resultRarity);
    selectedCards.forEach(card => actions.removeCard(card.id, 1));
    actions.recordCombine(rarity);
    if (INCENSE_RARITIES.has(rarity)) {
      if (hasGuarantee && upgradeTarget) {
        actions.updateIncense(rarity, true);
      } else if (!upgradedByRng) {
        actions.updateIncense(rarity, false);
      }
    }
    if (rewardCard) {
      actions.addCard(rewardCard.id, 1);
      const currentQty = profile.collection.inventory[rewardCard.id] ?? 0;
      if (currentQty === 0) {
        actions.markCardNew(rewardCard.id);
      }
    }
    setSelectedSlots(Array.from({ length: REQUIRED_CARDS }, () => null));
    setLastResult({
      base: rarity,
      result: resultRarity,
      card: rewardCard,
    });
  }

  const duplicateCards = CARDS.filter(
    card => (profile.collection.inventory[card.id] ?? 0) > 1
  );

  const incenseList = Array.from(INCENSE_RARITIES).map(rarity => ({
    rarity,
    value: profile.stats.incense[rarity] ?? 0,
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

  const selectedRarity = selectedSlots[0] ? rarityMap[selectedSlots[0]] : null;
  const incenseProgress = selectedRarity
    ? profile.stats.incense[selectedRarity] ?? 0
    : 0;
  const incenseTarget = selectedRarity
    ? getIncenseThreshold(selectedRarity)
    : 0;
  const upgradeChance =
    selectedRarity && incenseTarget > 0
      ? Math.min(100, Math.round((incenseProgress / incenseTarget) * 100))
      : 0;

  return (
    <div
      style={{
        padding: "var(--screen-padding)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        background: "radial-gradient(circle at top, #2a211a 0%, #120c08 70%)",
        borderRadius: 20,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-2)",
          paddingBottom: "var(--space-1)",
          borderBottom: "1px solid rgba(210, 176, 120, 0.4)",
        }}
      >
        <button
          type="button"
          style={{
            minWidth: 40,
            borderRadius: 999,
            border: "1px solid rgba(210, 176, 120, 0.6)",
            background: "linear-gradient(180deg, #2f261d 0%, #1b1410 100%)",
            color: "#f4e2c2",
            padding: "6px 10px",
          }}
        >
          ←
        </button>
        <h1
          style={{
            margin: 0,
            textAlign: "center",
            flex: 1,
            fontSize: 24,
            color: "#f4e2c2",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Fusion screen
        </h1>
        <button
          type="button"
          style={{
            minWidth: 40,
            borderRadius: 999,
            border: "1px solid rgba(210, 176, 120, 0.6)",
            background: "linear-gradient(180deg, #2f261d 0%, #1b1410 100%)",
            color: "#f4e2c2",
            padding: "6px 10px",
          }}
        >
          ⚙️
        </button>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.1fr)",
          gap: "var(--space-3)",
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-2)",
            justifyItems: "center",
          }}
        >
          {selectedSlots.map((slot, index) => (
            <div key={index} style={{ width: "100%" }}>
              {slot ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CardTile
                    card={cardMap[slot]}
                    obtained
                    onClick={() => handleRemoveSlot(index)}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: 8,
                    border: "1px solid rgba(210, 176, 120, 0.6)",
                    background: "rgba(27, 20, 16, 0.7)",
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#cbb38a",
                  }}
                >
                  {index === 0 || targetRarity ? "Slot vazio" : "Slot inicial"}
                </div>
              )}
            </div>
          ))}
        </div>

        <aside
          style={{
            border: "1px solid rgba(210, 176, 120, 0.6)",
            borderRadius: 12,
            background: "rgba(18, 14, 12, 0.9)",
            padding: "var(--space-2)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, color: "#f4e2c2" }}>
            Fusion rules
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "#d6c4a3" }}>
            Use quatro cartas da mesma raridade. A chance de upgrade aumenta
            conforme o incenso da raridade.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-1)",
              flexWrap: "wrap",
              fontSize: 12,
              color: "#bfa57b",
            }}
          >
            {incenseList.map(item => (
              <span key={item.rarity}>
                {item.rarity}: {item.value}/{getIncenseThreshold(item.rarity)}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          onClick={handleCombine}
          disabled={!canCombine}
          style={{
            padding: "10px 28px",
            fontSize: 16,
            letterSpacing: "0.12em",
            borderRadius: 12,
            border: "1px solid rgba(210, 176, 120, 0.8)",
            background: canCombine
              ? "linear-gradient(180deg, #5b3a16 0%, #2d1a09 100%)"
              : "linear-gradient(180deg, #3a2a20 0%, #221812 100%)",
            color: canCombine ? "#f8e6c7" : "#9c8a6f",
            boxShadow: canCombine ? "0 12px 24px rgba(0,0,0,0.35)" : "none",
          }}
        >
          FUSE
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          fontSize: 14,
          color: "#e7d6b4",
        }}
      >
        <span
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg, transparent, #cbb38a, transparent)",
          }}
        />
        <strong>Result preview</strong>
        <span
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg, transparent, #cbb38a, transparent)",
          }}
        />
      </div>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        {lastResult?.card ? (
          <CardTile card={lastResult.card} obtained />
        ) : (
          <div
            style={{
              width: "min(220px, 60vw)",
              aspectRatio: "1 / 1",
              borderRadius: 8,
              border: "1px solid rgba(210, 176, 120, 0.7)",
              background: "rgba(24, 18, 15, 0.7)",
              boxShadow: "0 0 24px rgba(118, 86, 52, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#cbb38a",
            }}
          >
            Resultado
          </div>
        )}

        <div style={{ width: "min(320px, 100%)", fontSize: 12, color: "#d6c4a3" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Upgrade chance</span>
            <strong>{selectedRarity ? `${upgradeChance}%` : "--"}</strong>
          </div>
          <div
            style={{
              marginTop: "var(--space-1)",
              height: 6,
              borderRadius: 999,
              border: "1px solid rgba(210, 176, 120, 0.6)",
              background: "rgba(14, 10, 8, 0.8)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${upgradeChance}%`,
                height: "100%",
                background: "linear-gradient(90deg, #8a5a1f, #e0c08a)",
              }}
            />
          </div>
        </div>

        {lastResult && (
          <p style={{ margin: 0, fontSize: 12, color: "#d6c4a3" }}>
            {lastResult.base} → {lastResult.result}
          </p>
        )}
      </section>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        <strong style={{ fontSize: 12, color: "#f4e2c2" }}>
          Repetidas disponíveis
        </strong>
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            gap: "var(--space-2)",
            overflowX: "auto",
            paddingBottom: "var(--space-1)",
          }}
        >
          {duplicateCards.length === 0 && (
            <div
              style={{
                border: "1px dashed rgba(210, 176, 120, 0.6)",
                borderRadius: 12,
                padding: "var(--space-2)",
                fontSize: 12,
                color: "#cbb38a",
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
                  (profile.collection.inventory[card.id] ?? 0) - 1
                )}
                onClick={() => handleSelectCard(card)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
