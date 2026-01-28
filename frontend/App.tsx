import { useState } from "react";
import { TowerScreen } from "./screens/TowerScreen";
import { CampaignTowerScreen } from "./screens/CampaignTowerScreen";
import { CardsScreen } from "./screens/CardsScreen";
import { ChestsScreen } from "./screens/ChestsScreen";
import { AwakeningScreen } from "./screens/AwakeningScreen";
import { CombiningScreen } from "./screens/CombiningScreen";
import { CollectionScreen } from "./screens/CollectionScreen";
import { PvpScreen } from "./screens/PvpScreen";
import { GameProvider } from "./hooks/useGame";

type Screen =
  | "MENU"
  | "TOWER"
  | "CAMPAIGN_TOWER"
  | "CARDS"
  | "CHESTS"
  | "AWAKENING"
  | "COMBINING"
  | "COLLECTION"
  | "PVP"
  | "EVOLUTION";

function App() {
  const [screen, setScreen] = useState<Screen>("MENU");

  let content = (
    <div style={{ padding: "var(--screen-padding)" }}>
      <h1>🃏 Card Battle</h1>
      <p>Escolha um modo para começar.</p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          marginTop: "var(--space-2)",
        }}
      >
        <button onClick={() => setScreen("CAMPAIGN_TOWER")}>🧭 Campanha</button>
        <button onClick={() => setScreen("TOWER")}>🏰 Torre</button>
        <button onClick={() => setScreen("PVP")}>⚔️ PvP</button>
      </div>
    </div>
  );

  if (screen === "TOWER") {
    content = <TowerScreen />;
  }

  if (screen === "CAMPAIGN_TOWER") {
    content = <CampaignTowerScreen />;
  }

  if (screen === "CARDS") {
    content = <CardsScreen />;
  }

  if (screen === "CHESTS") {
    content = <ChestsScreen />;
  }

  if (screen === "AWAKENING") {
    content = <AwakeningScreen />;
  }

  if (screen === "COMBINING") {
    content = <CombiningScreen />;
  }

  if (screen === "COLLECTION") {
    content = <CollectionScreen />;
  }

  if (screen === "PVP") {
    content = <PvpScreen />;
  }

  if (screen === "EVOLUTION") {
    content = (
      <div style={{ padding: "var(--screen-padding)" }}>
        <h1>✨ Evolução</h1>
        <p>Escolha uma opção para evoluir suas cartas.</p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
            marginTop: "var(--space-2)",
          }}
        >
          <button onClick={() => setScreen("AWAKENING")}>✨ Despertar</button>
          <button onClick={() => setScreen("COMBINING")}>🔮 Combinação</button>
        </div>
      </div>
    );
  }

  return (
    <GameProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-2)",
          background: "#0b0b0b",
        }}
      >
        <div
          style={{
            width: "min(var(--ui-artboard-width), 100vw, calc(100vh * 9 / 20))",
            maxHeight: "min(var(--ui-artboard-height), 100vh)",
            aspectRatio: "9 / 20",
            background: "#111",
            borderRadius: 24,
            boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
            overflowX: "hidden",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: 0,
              boxSizing: "border-box",
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            <div style={{ flex: 1 }}>{content}</div>
          </div>
          <nav
            style={{
              borderTop: "1px solid #333",
              padding: "var(--space-2) var(--screen-padding)",
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "center",
              background: "#111",
              flexWrap: "wrap",
              position: "sticky",
              bottom: 0,
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setScreen("MENU")}
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontWeight: screen === "MENU" ? "bold" : "normal",
              }}
              aria-label="Início"
            >
              🏠
            </button>
            <button
              onClick={() => setScreen("CARDS")}
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontWeight: screen === "CARDS" ? "bold" : "normal",
              }}
              aria-label="Deck"
            >
              🃏
            </button>
            <button
              onClick={() => setScreen("EVOLUTION")}
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontWeight: screen === "EVOLUTION" ? "bold" : "normal",
              }}
              aria-label="Evolução"
            >
              ✨
            </button>
            <button
              onClick={() => setScreen("COLLECTION")}
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontWeight: screen === "COLLECTION" ? "bold" : "normal",
              }}
              aria-label="Coleção"
            >
              🗂️
            </button>
            <button
              onClick={() => setScreen("CHESTS")}
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontWeight: screen === "CHESTS" ? "bold" : "normal",
              }}
              aria-label="Loja"
            >
              🏪
            </button>
          </nav>
        </div>
      </div>
    </GameProvider>
  );
}

export default App;
