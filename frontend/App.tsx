import { useState } from "react";
import { TowerScreen } from "./screens/TowerScreen";

type Screen = "MENU" | "TOWER";

function App() {
  const [screen, setScreen] = useState<Screen>("MENU");

  if (screen === "TOWER") {
    return <TowerScreen />;
  }

  // MENU MVP
  return (
    <div style={{ padding: 20 }}>
      <h1>🃏 Card Battle</h1>

      <button onClick={() => setScreen("TOWER")}>
        🏰 Entrar na Torre
      </button>
    </div>
  );
}

export default App;