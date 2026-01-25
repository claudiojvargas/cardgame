import { useState } from "react";
import { TowerScreen } from "./screens/TowerScreen";
import { CampaignTowerScreen } from "./screens/CampaignTowerScreen";
import { CardsScreen } from "./screens/CardsScreen";
import { ChestsScreen } from "./screens/ChestsScreen";
import { AwakeningScreen } from "./screens/AwakeningScreen";
import { CombiningScreen } from "./screens/CombiningScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
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
  | "PROFILE"
  | "COLLECTION"
  | "PVP";

function App() {
  const [screen, setScreen] = useState<Screen>("MENU");

  let content = (
    <div style={{ padding: 20 }}>
      <h1>🃏 Card Battle</h1>
      <p>Escolha um modo para começar.</p>
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

  if (screen === "PROFILE") {
    content = <ProfileScreen />;
  }

  if (screen === "COLLECTION") {
    content = <CollectionScreen />;
  }

  if (screen === "PVP") {
    content = <PvpScreen />;
  }

  return (
    <GameProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1 }}>{content}</div>
        <nav
          style={{
            borderTop: "1px solid #333",
            padding: "12px 20px",
            display: "flex",
            gap: 12,
            justifyContent: "center",
            background: "#111",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setScreen("TOWER")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "TOWER" ? "bold" : "normal",
            }}
          >
            🏰 Torre
          </button>
          <button
            onClick={() => setScreen("CAMPAIGN_TOWER")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "CAMPAIGN_TOWER" ? "bold" : "normal",
            }}
          >
            🧭 Torre Campanha
          </button>
          <button
            onClick={() => setScreen("CARDS")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "CARDS" ? "bold" : "normal",
            }}
          >
            📚 Ver Cartas
          </button>
          <button
            onClick={() => setScreen("COLLECTION")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "COLLECTION" ? "bold" : "normal",
            }}
          >
            🗂️ Coleção
          </button>
          <button
            onClick={() => setScreen("CHESTS")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "CHESTS" ? "bold" : "normal",
            }}
          >
            🎁 Baús
          </button>
          <button
            onClick={() => setScreen("AWAKENING")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "AWAKENING" ? "bold" : "normal",
            }}
          >
            ✨ Despertar
          </button>
          <button
            onClick={() => setScreen("COMBINING")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "COMBINING" ? "bold" : "normal",
            }}
          >
            🔮 Combinar
          </button>
          <button
            onClick={() => setScreen("PROFILE")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "PROFILE" ? "bold" : "normal",
            }}
          >
            🙍 Perfil
          </button>
          <button
            onClick={() => setScreen("PVP")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "PVP" ? "bold" : "normal",
            }}
          >
            ⚔️ PvP
          </button>
        </nav>
      </div>
    </GameProvider>
  );
}

export default App;
