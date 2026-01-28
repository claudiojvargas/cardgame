import { useMemo, useState } from "react";
import { TowerScreen } from "./screens/TowerScreen";
import { CampaignTowerScreen } from "./screens/CampaignTowerScreen";
import { CardsScreen } from "./screens/CardsScreen";
import { ChestsScreen } from "./screens/ChestsScreen";
import { AwakeningScreen } from "./screens/AwakeningScreen";
import { CombiningScreen } from "./screens/CombiningScreen";
import { CollectionScreen } from "./screens/CollectionScreen";
import { PvpScreen } from "./screens/PvpScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { GameProvider, useGame } from "./hooks/useGame";

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
  | "EVOLUTION"
  | "PROFILE";

function AppShell() {
  const { profile } = useGame();
  const [screen, setScreen] = useState<Screen>("MENU");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const avatarSrc = useMemo(() => {
    const initial =
      profile.displayName?.trim().charAt(0).toUpperCase() || "J";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="100%" height="100%" fill="#2b2b2b"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="32" fill="#fff">${initial}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [profile.displayName]);

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

  if (screen === "PROFILE") {
    content = <ProfileScreen />;
  }

  return (
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
          backgroundColor: "#111",
          backgroundImage: "url('/backgrounds/galaxy.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderRadius: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--screen-padding)",
            borderBottom: "1px solid #333",
            background: "#111",
          }}
        >
          <button
            onClick={() => setScreen("PROFILE")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="Perfil do usuário"
          >
            <img
              src={avatarSrc}
              alt={`Avatar de ${profile.displayName}`}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "2px solid #444",
              }}
            />
            <span style={{ fontWeight: 600 }}>{profile.displayName}</span>
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "#fff",
              fontSize: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden>🪙</span>
              <span>{profile.currencies.gold}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden>💎</span>
              <span>{profile.currencies.diamonds}</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 18,
              }}
              aria-label="Configurações"
            >
              ⚙️
            </button>
          </div>
        </header>
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
        {isSettingsOpen ? (
          <div
            onClick={() => setIsSettingsOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
            }}
          >
            <div
              onClick={event => event.stopPropagation()}
              style={{
                width: "70%",
                height: "50%",
                background: "#1b1b1b",
                borderRadius: 16,
                padding: "var(--space-3)",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2>⚙️ Configurações</h2>
                <p>Ajustes rápidos do jogo.</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{
                  alignSelf: "flex-end",
                  padding: "var(--space-1) var(--space-3)",
                }}
              >
                Sair
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}

export default App;
