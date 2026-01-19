import { useState, useMemo } from "react";
import { GameBoard } from "../components/GameBoard";
import { useGame } from "../hooks/useGame";
import { createPlayer } from "../gameSetup";

import { Player } from "../../game/entities/Player";
import { GameState } from "../../game/core/GameState";
import { GameStatus } from "../../game/types/enums";

import { TowerEnemyFactory } from "../../game/tower/TowerEnemyFactory";

export function TowerScreen() {
  const [floor, setFloor] = useState(1);
  const [floorClears, setFloorClears] = useState<Record<number, number>>(
    {}
  );
  const [chests, setChests] = useState<
    Array<{ id: string; floor: number; type: string }>
  >([]);
  const [chestCounter, setChestCounter] = useState(1);

  // Player é persistente na run
  const player = useMemo(() => createPlayer(), []);

  function createGameState(currentFloor: number): GameState {
    const enemyDeck = TowerEnemyFactory.createEnemy(currentFloor);
    const enemy = new Player("AI", enemyDeck);

    return new GameState(
      [player, enemy],
      Math.random() > 0.5 ? 0 : 1,
      1,
      GameStatus.IN_PROGRESS
    );
  }

  // Estado inicial da batalha atual
  const [initialState, setInitialState] = useState<GameState>(() =>
    createGameState(floor)
  );

  const { state, playerAttack, lastAiAction } = useGame(initialState);

  function nextFloor() {
    const next = floor + 1;
    setFloor(next);
    setInitialState(createGameState(next));
  }

  function handleDefeat() {
    setFloor(1);
    setInitialState(createGameState(1));
  }

  function grantChest(currentFloor: number) {
    setFloorClears(prev => {
      const nextCount = (prev[currentFloor] ?? 0) + 1;
      const chestId = `bau-${currentFloor}-${nextCount}-${chestCounter}`;
      setChestCounter(value => value + 1);
      setChests(existing => [
        ...existing,
        {
          id: chestId,
          floor: currentFloor,
          type: nextCount === 1 ? "Primeira conquista" : "Repetição",
        },
      ]);
      return { ...prev, [currentFloor]: nextCount };
    });
  }

  return (
    <div
      style={{
        padding: 20,
        height: "calc(100vh - 72px)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>🏰 Torre</h1>
        <h2 style={{ margin: 0, fontSize: 18 }}>Andar {floor} / 30</h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 260px",
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}
      >
        <GameBoard
          state={state}
          onAttack={playerAttack}
          lastAiDefenderId={lastAiAction?.defenderId ?? null}
        />

        <aside
          style={{
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div>
            <h3 style={{ marginTop: 0 }}>🧠 Última jogada</h3>
            {lastAiAction ? (
              <p style={{ margin: 0, color: "#333" }}>
                🤖 {lastAiAction.attackerId} atacou{" "}
                {lastAiAction.defenderId}
              </p>
            ) : (
              <p style={{ margin: 0, color: "#666" }}>
                Aguardando ação do bot.
              </p>
            )}
          </div>
          <div>
            <h3 style={{ marginTop: 0 }}>🎁 Baús</h3>
            {chests.length === 0 ? (
              <p style={{ margin: 0, color: "#666" }}>
                Nenhum baú ainda.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {chests.slice(-5).map(chest => (
                  <li key={chest.id}>
                    Andar {chest.floor}: {chest.type}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {state.status === GameStatus.FINISHED && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: 12,
              padding: 24,
              minWidth: 280,
              textAlign: "center",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            }}
          >
            {state.winnerId === "Player" ? (
              <>
                <h2>✅ Vitória!</h2>
                <button
                  onClick={() => {
                    grantChest(floor);
                    nextFloor();
                  }}
                >
                  Próximo andar
                </button>
              </>
            ) : (
              <>
                <h2>❌ Derrota</h2>
                <button
                  onClick={() => {
                    handleDefeat();
                  }}
                >
                  Voltar ao início
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
