import { useState } from "react";
import { TowerScreen } from "./screens/TowerScreen";
import { CardsScreen } from "./screens/CardsScreen";

type Screen = "MENU" | "TOWER" | "CARDS";

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

  return (
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
      </nav>
    </div>
  );
}

export default App;
