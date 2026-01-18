import { useState } from "react";
import { TowerScreen } from "./screens/TowerScreen";
import { CardsScreen } from "./screens/CardsScreen";

type Screen = "MENU" | "TOWER" | "CARDS";

function App() {
  const [screen, setScreen] = useState<Screen>("MENU");

  if (screen === "TOWER") {
    return <TowerScreen />;
  }

  if (screen === "CARDS") {
    return <CardsScreen />;
  }

  // MENU MVP
  return (
    <div style={{ padding: 20 }}>
      <h1>🃏 Card Battle</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => setScreen("TOWER")}>
          🏰 Entrar na Torre
        </button>
        <button onClick={() => setScreen("CARDS")}>
          📚 Ver Cartas
        </button>
      </div>
    </div>
  );
}

export default App;
