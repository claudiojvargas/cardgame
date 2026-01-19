import { useEffect, useState } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { CHESTS } from "../../game/data/chests.catalog";
import { Card } from "../../game/entities/Card";
import {
  loadInventory,
  saveInventory,
  loadWallet,
  saveWallet,
  type PlayerInventory,
  type PlayerWallet,
} from "../utils/inventory";

export function ChestsScreen() {
  const [wallet, setWallet] = useState<PlayerWallet>(() => loadWallet());
  const [inventory, setInventory] = useState<PlayerInventory>(() =>
    loadInventory([])
  );
  const [lastReward, setLastReward] = useState<{
    chestName: string;
    gold: number;
    cards: Card[];
  } | null>(null);

  useEffect(() => {
    saveWallet(wallet);
  }, [wallet]);

  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function drawCards(rarities: Card["rarity"][], amount: number): Card[] {
    const pool = CARDS.filter(card => rarities.includes(card.rarity));
    if (pool.length === 0) return [];
    return Array.from({ length: amount }, () => {
      const card = pool[Math.floor(Math.random() * pool.length)];
      return card.clone();
    });
  }

  function handleOpenChest(chestType: (typeof CHESTS)[number]) {
    const goldReward = randomBetween(chestType.goldRange[0], chestType.goldRange[1]);
    const cards = drawCards(chestType.cardRarities, 4);

    const updatedCounts = { ...inventory.counts };
    const updatedNew = new Set(inventory.newCards);

    cards.forEach(card => {
      const current = updatedCounts[card.id] ?? 0;
      updatedCounts[card.id] = current + 1;
      if (current === 0) {
        updatedNew.add(card.id);
      }
    });

    const nextInventory: PlayerInventory = {
      counts: updatedCounts,
      newCards: Array.from(updatedNew),
    };

    const nextWallet: PlayerWallet = {
      ...wallet,
      gold: wallet.gold + goldReward,
    };

    setInventory(nextInventory);
    setWallet(nextWallet);
    setLastReward({
      chestName: chestType.name,
      gold: goldReward,
      cards,
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🎁 Baús</h1>
      <p>Abra baús para obter cartas e ouro.</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: 12,
            padding: 12,
            minWidth: 140,
          }}
        >
          <strong>Ouro</strong>
          <div>{wallet.gold}</div>
        </div>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: 12,
            padding: 12,
            minWidth: 140,
          }}
        >
          <strong>Diamantes</strong>
          <div>{wallet.diamonds}</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {CHESTS.map(chest => (
          <div
            key={chest.type}
            style={{
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
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
              style={{ marginTop: 8 }}
              onClick={() => handleOpenChest(chest)}
            >
              Abrir
            </button>
          </div>
        ))}
      </div>

      {lastReward && (
        <div style={{ marginTop: 24 }}>
          <h3>Última abertura: {lastReward.chestName}</h3>
          <p>Ouro recebido: {lastReward.gold}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {lastReward.cards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  padding: 8,
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
