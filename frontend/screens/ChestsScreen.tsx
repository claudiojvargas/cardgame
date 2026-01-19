import { useMemo } from "react";
import { CHESTS } from "../../game/data/chests.catalog";

export function ChestsScreen() {
  const wallet = useMemo(
    () => ({
      gold: 1250,
      diamonds: 40,
    }),
    []
  );

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
            <button type="button" style={{ marginTop: 8 }}>
              Comprar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
