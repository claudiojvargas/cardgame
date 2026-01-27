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
  const slotPositions = [
    { label: "Slot A", index: 0, gridColumn: "1 / 2", gridRow: "1" },
    { label: "Slot B", index: 1, gridColumn: "2 / 3", gridRow: "1" },
    { label: "Slot C", index: 2, gridColumn: "1 / 2", gridRow: "2" },
    { label: "Slot D", index: 3, gridColumn: "2 / 3", gridRow: "2" },
  ];

  return (
    <div
      style={{
        padding: "var(--screen-padding)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        background: "linear-gradient(180deg, #0f0f13 0%, #121216 100%)",
        borderRadius: 20,
        height: "100%",
        minHeight: 0,
        justifyContent: "space-between",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-2)",
          paddingBottom: "var(--space-1)",
          borderBottom: "1px solid rgba(148, 156, 178, 0.35)",
        }}
      >
        <button
          type="button"
          style={{
            minWidth: 56,
            borderRadius: 999,
            border: "1px solid rgba(148, 156, 178, 0.6)",
            background: "#14141a",
            color: "#d5d9e6",
            padding: "6px 12px",
            fontSize: 12,
          }}
        >
          Back
        </button>
        <h1
          style={{
            margin: 0,
            textAlign: "center",
            flex: 1,
            fontSize: 24,
            color: "#e3e6f5",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Fusão
        </h1>
        <button
          type="button"
          style={{
            minWidth: 56,
            borderRadius: 999,
            border: "1px solid rgba(148, 156, 178, 0.6)",
            background: "#14141a",
            color: "#d5d9e6",
            padding: "6px 12px",
            fontSize: 12,
          }}
        >
          Gear
        </button>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-2)",
          alignItems: "start",
        }}
      >
        {slotPositions.map(slotInfo => {
          const slot = selectedSlots[slotInfo.index];
          return (
            <div
              key={slotInfo.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gridColumn: slotInfo.gridColumn,
                gridRow: slotInfo.gridRow,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#d5d9e6",
                  marginBottom: "var(--space-1)",
                }}
              >
                {slotInfo.label}
              </div>
              {slot ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CardTile
                    card={cardMap[slot]}
                    obtained
                    onClick={() => handleRemoveSlot(slotInfo.index)}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "2 / 3",
                    borderRadius: 12,
                    border: "1px solid rgba(222, 228, 245, 0.6)",
                    background: "#121219",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#9aa3bd",
                  }}
                >
                  {slotInfo.index === 0 || targetRarity ? "Slot vazio" : "Slot inicial"}
                </div>
              )}
            </div>
          );
        })}

        <aside
          style={{
            gridColumn: "3 / 4",
            gridRow: "1 / span 2",
            border: "1px solid rgba(222, 228, 245, 0.6)",
            borderRadius: 12,
            background: "#121219",
            padding: "var(--space-2)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 14, color: "#e3e6f5" }}>
            Fusion rules
          </h2>
          <div
            style={{
              borderTop: "1px solid rgba(222, 228, 245, 0.2)",
              paddingTop: "var(--space-1)",
              fontSize: 12,
              color: "#c4cada",
              lineHeight: 1.4,
            }}
          >
            Use quatro cartas da mesma raridade. A chance de upgrade aumenta
            conforme o incenso da raridade.
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
              fontSize: 12,
              color: "#b8bfd2",
            }}
          >
            {incenseList.map(item => (
              <div key={item.rarity}>
                {item.rarity}: {item.value}/{getIncenseThreshold(item.rarity)}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#d5d9e6" }}>
            Repetidas
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-1)",
              maxHeight: 120,
              overflowY: "auto",
            }}
          >
            {duplicateCards.length === 0 && (
              <div style={{ fontSize: 12, color: "#9aa3bd" }}>
                Sem repetidas
              </div>
            )}
            {duplicateCards.map(card => (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectCard(card)}
                style={{
                  borderRadius: 8,
                  border: "1px solid rgba(148, 156, 178, 0.5)",
                  background: "#161620",
                  color: "#d5d9e6",
                  padding: "4px 6px",
                  fontSize: 11,
                }}
              >
                {card.name}
              </button>
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
            padding: "12px 48px",
            fontSize: 16,
            letterSpacing: "0.12em",
            borderRadius: 14,
            border: "1px solid rgba(231, 201, 132, 0.9)",
            background: canCombine
              ? "linear-gradient(180deg, #3d2f0f 0%, #1f1708 100%)"
              : "linear-gradient(180deg, #2a2520 0%, #19161a 100%)",
            color: canCombine ? "#f0d9a0" : "#8f8793",
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
          color: "#c4cada",
        }}
      >
        <span
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg, transparent, #8088a3, transparent)",
          }}
        />
        <strong>Result preview</strong>
        <span
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg, transparent, #8088a3, transparent)",
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
              width: "min(240px, 70vw)",
              aspectRatio: "2 / 3",
              borderRadius: 12,
              border: "2px solid rgba(196, 160, 255, 0.8)",
              background: "#121219",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#cbb7f0",
            }}
          >
            Resultado
          </div>
        )}

        <div style={{ width: "min(320px, 100%)", fontSize: 12, color: "#c4cada" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Upgrade chance</span>
            <strong>{selectedRarity ? `${upgradeChance}%` : "--"}</strong>
          </div>
          <div
            style={{
              marginTop: "var(--space-1)",
              height: 8,
              borderRadius: 999,
              border: "1px solid rgba(196, 160, 255, 0.6)",
              background: "#1b1b24",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${upgradeChance}%`,
                height: "100%",
                background: "linear-gradient(90deg, #b487ff, #e2c2ff)",
              }}
            />
          </div>
        </div>

        {lastResult && (
          <p style={{ margin: 0, fontSize: 12, color: "#c4cada" }}>
            {lastResult.base} → {lastResult.result}
          </p>
        )}
      </section>

    </div>
  );
}
