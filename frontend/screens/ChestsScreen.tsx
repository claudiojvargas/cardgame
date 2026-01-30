import { useState } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { CHESTS } from "../../game/data/chests.catalog";
import { Card } from "../../game/entities/Card";
import { useGame } from "../hooks/useGame";

export function ChestsScreen() {
  const { profile, actions } = useGame();
  const [lastReward, setLastReward] = useState<{
    chestName: string;
    gold: number;
    cards: Card[];
  } | null>(null);

  function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function rollRarity(chestType: (typeof CHESTS)[number]) {
    const totalWeight = chestType.rarityRates.reduce(
      (sum, entry) => sum + entry.weight,
      0
    );
    if (totalWeight <= 0) {
      return chestType.cardRarities[0];
    }
    let roll = Math.random() * totalWeight;
    for (const entry of chestType.rarityRates) {
      roll -= entry.weight;
      if (roll <= 0) {
        return entry.rarity;
      }
    }
    return chestType.rarityRates[chestType.rarityRates.length - 1].rarity;
  }

  function drawCards(chestType: (typeof CHESTS)[number], amount: number): Card[] {
    return Array.from({ length: amount }, () => {
      const rarity = rollRarity(chestType);
      const pool = CARDS.filter(card => card.rarity === rarity);
      if (pool.length === 0) return null;
      const card = pool[Math.floor(Math.random() * pool.length)];
      return card.clone();
    }).filter((card): card is Card => Boolean(card));
  }

  function handleOpenChest(chestType: (typeof CHESTS)[number]) {
    if (profile.currencies.gold < chestType.priceGold) return;
    const goldReward = randomBetween(chestType.goldRange[0], chestType.goldRange[1]);
    const cards = drawCards(chestType, 4);

    actions.spendCurrency("gold", chestType.priceGold);
    if (goldReward > 0) {
      actions.addCurrency("gold", goldReward);
    }
    actions.recordChestOpened(chestType.type);
    cards.forEach(card => {
      actions.addCard(card.id, 1);
      const currentQty = profile.collection.inventory[card.id] ?? 0;
      if (currentQty === 0) {
        actions.markCardNew(card.id);
      }
    });

    setLastReward({
      chestName: chestType.name,
      gold: goldReward,
      cards,
    });
  }

  return (
    <div style={{ padding: "var(--screen-padding)" }}>
      <h1>🛍️ Loja</h1>
      <p>Compre baús para obter cartas e ouro.</p>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-2)",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: 16,
            padding: "var(--space-2)",
            minWidth: 144,
          }}
        >
          <strong>Ouro</strong>
          <div>{profile.currencies.gold}</div>
        </div>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: 16,
            padding: "var(--space-2)",
            minWidth: 144,
          }}
        >
          <strong>Diamantes</strong>
          <div>{profile.currencies.diamonds}</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(224px, 1fr))",
          gap: "var(--space-2)",
        }}
      >
        {CHESTS.map(chest => (
          <div
            key={chest.type}
            style={{
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: 16,
              padding: "var(--space-2)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
            }}
          >
            <h3 style={{ margin: 0 }}>{chest.name}</h3>
            <div>
              <strong>Preço:</strong> {chest.priceGold} ouro
            </div>
            <div>
              <strong>Ouro:</strong> {chest.goldRange[0]} -{" "}
              {chest.goldRange[1]}
            </div>
            <div>
              <strong>Raridades:</strong> {chest.cardRarities.join(", ")}
            </div>
            <button
              type="button"
              style={{ marginTop: "var(--space-1)" }}
              onClick={() => handleOpenChest(chest)}
            >
              Abrir
            </button>
          </div>
        ))}
      </div>

      {lastReward && (
        <div style={{ marginTop: "var(--space-3)" }}>
          <h3>Última abertura: {lastReward.chestName}</h3>
          <p>Ouro recebido: {lastReward.gold}</p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-2)",
            }}
          >
            {lastReward.cards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  padding: "var(--space-1)",
                  background: "#ffffff",
                  minWidth: 160,
                }}
              >
                <strong>{card.name}</strong>
                <div>Raridade: {card.rarity}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
