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
  const upgradeChance = selectedRarity
    ? Math.min(100, Math.round((incenseProgress / incenseTarget) * 100))
    : 0;

  return (
    <div
      style={{
        padding: "var(--screen-padding)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-2)",
        }}
      >
        <button type="button" style={{ minWidth: 48 }}>
          ←
        </button>
        <h1 style={{ margin: 0, textAlign: "center", flex: 1 }}>Fusão</h1>
        <button type="button" style={{ minWidth: 48 }}>
          ⚙️
        </button>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: "var(--space-3)",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <p style={{ margin: 0 }}>
            Combine 4 cartas da mesma raridade para tentar evoluir.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "var(--space-2)",
            }}
          >
            {selectedSlots.map((slot, index) => (
              <div key={index} style={{ justifySelf: "center" }}>
                {slot ? (
                  <CardTile
                    card={cardMap[slot]}
                    obtained
                    onClick={() => handleRemoveSlot(index)}
                  />
                ) : (
                  <div
                    style={{
                      height: "auto",
                      width: "var(--card-ui-width)",
                      aspectRatio: "var(--card-ui-aspect)",
                      borderRadius: 8,
                      border: "1px dashed #bbb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {index === 0 || targetRarity ? "Slot vazio" : "Slot inicial"}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            <button type="button" onClick={handleAutoSelect}>
              Selecionar automático
            </button>
            <button type="button" onClick={handleClearSlots}>
              Limpar
            </button>
            <button type="button" onClick={handleCombine} disabled={!canCombine}>
              Fundir
            </button>
          </div>
        </div>

        <aside
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 16,
            padding: "var(--space-2)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <h2 style={{ margin: 0 }}>Regras da fusão</h2>
          <p style={{ margin: 0 }}>
            Use quatro cartas da mesma raridade. A chance de upgrade aumenta
            conforme o incenso da raridade.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            {incenseList.map(item => (
              <div key={item.rarity}>
                {item.rarity}: {item.value}/{getIncenseThreshold(item.rarity)}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h2 style={{ margin: 0 }}>Repetidas disponíveis</h2>
        <p style={{ margin: 0 }}>
          Clique em uma carta repetida para enviar para um slot.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-2)",
            maxHeight: "32vh",
            overflowY: "auto",
            paddingRight: "var(--space-1)",
          }}
        >
          {duplicateCards.length === 0 && (
            <div
              style={{
                border: "1px dashed #bbb",
                borderRadius: 16,
                padding: "var(--space-2)",
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

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h2 style={{ margin: 0 }}>Prévia do resultado</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
            alignItems: "center",
          }}
        >
          {lastResult?.card ? (
            <CardTile card={lastResult.card} obtained />
          ) : (
            <div
              style={{
                height: "auto",
                width: "var(--card-ui-width)",
                aspectRatio: "var(--card-ui-aspect)",
                borderRadius: 8,
                border: "1px dashed #bbb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Resultado
            </div>
          )}
          <div style={{ width: "min(320px, 100%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Chance de upgrade</span>
              <strong>{selectedRarity ? `${upgradeChance}%` : "--"}</strong>
            </div>
            <div
              style={{
                marginTop: "var(--space-1)",
                height: 8,
                borderRadius: 999,
                border: "1px solid #bbb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${upgradeChance}%`,
                  height: "100%",
                  background: "#bbb",
                }}
              />
            </div>
          </div>
          {lastResult && (
            <p style={{ margin: 0 }}>
              {lastResult.base} → {lastResult.result}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
