import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { Rarity } from "../../game/types/enums";
import { useGame } from "../hooks/useGame";

const RARITY_ORDER: Rarity[] = [
  Rarity.COMMON,
  Rarity.UNCOMMON,
  Rarity.RARE,
  Rarity.EPIC,
  Rarity.LEGENDARY,
  Rarity.MYTHIC,
  Rarity.DIAMOND,
];

function buildRarityMap() {
  return CARDS.reduce<Record<string, Rarity>>((acc, card) => {
    acc[card.id] = card.rarity;
    return acc;
  }, {});
}

export function ProfileScreen() {
  const { profile, actions } = useGame();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const rarityMap = useMemo(() => buildRarityMap(), []);

  useEffect(() => {
    setDisplayName(profile.displayName);
  }, [profile.displayName]);

  const totalCards = useMemo(
    () =>
      Object.values(profile.collection.inventory).reduce(
        (sum, qty) => sum + qty,
        0
      ),
    [profile.collection.inventory]
  );

  const uniqueCards = useMemo(
    () =>
      Object.values(profile.collection.inventory).filter(qty => qty > 0).length,
    [profile.collection.inventory]
  );

  const rarityCounts = useMemo(() => {
    return Object.entries(profile.collection.inventory).reduce<Record<Rarity, number>>(
      (acc, [cardId, qty]) => {
        const rarity = rarityMap[cardId];
        if (!rarity) return acc;
        acc[rarity] = (acc[rarity] ?? 0) + qty;
        return acc;
      },
      RARITY_ORDER.reduce<Record<Rarity, number>>((acc, rarity) => {
        acc[rarity] = 0;
        return acc;
      }, {} as Record<Rarity, number>)
    );
  }, [profile.collection.inventory, rarityMap]);

  function handleSaveName() {
    const trimmed = displayName.trim();
    if (!trimmed) return;
    actions.renamePlayer(trimmed);
  }

  return (
    <div
      style={{
        padding: "var(--screen-padding)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <section
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e0e0e0",
          padding: "var(--space-2)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#f0f0f0",
            border: "2px solid #ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          🧙
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>Perfil</h1>
          <p style={{ margin: "var(--space-1) 0 var(--space-2)", color: "#666" }}>
            ID: {profile.id}
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <input
              type="text"
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              style={{
                padding: "var(--space-1) var(--space-2)",
                borderRadius: 8,
                border: "1px solid #ccc",
                minWidth: 224,
              }}
            />
            <button type="button" onClick={handleSaveName}>
              Salvar nome
            </button>
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: "var(--space-2)",
          gridTemplateColumns: "repeat(auto-fit, minmax(224px, 1fr))",
        }}
      >
        <div style={cardStyle}>
          <strong>🏰 Progresso</strong>
          <div>Melhor andar: {profile.progress.tower.bestFloor}</div>
          <div>Runs: {profile.progress.tower.runs}</div>
          <div>Vitórias: {profile.progress.tower.wins}</div>
          <div>Derrotas: {profile.progress.tower.losses}</div>
        </div>
        <div style={cardStyle}>
          <strong>💰 Economia</strong>
          <div>Ouro: {profile.currencies.gold}</div>
          <div>Diamantes: {profile.currencies.diamonds}</div>
        </div>
        <div style={cardStyle}>
          <strong>🎴 Coleção</strong>
          <div>Total de cartas: {totalCards}</div>
          <div>Únicas: {uniqueCards}</div>
          <div style={{ marginTop: "var(--space-1)" }}>
            {RARITY_ORDER.map(rarity => (
              <div key={rarity}>
                {rarity}: {rarityCounts[rarity] ?? 0}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <button type="button">Ver Codex</button>
        <button type="button" onClick={() => actions.markAllAsSeen()}>
          Marcar tudo como visto
        </button>
      </section>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid #e0e0e0",
  padding: "var(--space-2)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
};
