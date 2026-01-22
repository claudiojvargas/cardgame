import { useState } from "react";
import { TowerScreen } from "./screens/TowerScreen";
import { CardsScreen } from "./screens/CardsScreen";
import { ChestsScreen } from "./screens/ChestsScreen";
import { AwakeningScreen } from "./screens/AwakeningScreen";
import { CombiningScreen } from "./screens/CombiningScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { GameProvider } from "./hooks/useGame";

type Screen =
  | "MENU"
  | "TOWER"
  | "CARDS"
  | "CHESTS"
  | "AWAKENING"
  | "COMBINING"
  | "PROFILE";

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
            onClick={() => setScreen("CARDS")}
            style={{
              padding: "8px 16px",
              fontWeight: screen === "CARDS" ? "bold" : "normal",
            }}
          >
            📚 Ver Cartas
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
        </nav>
      </div>
    </GameProvider>
  );
}

export default App;
