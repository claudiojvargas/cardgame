import { useState, useMemo } from "react";
import { GameBoard } from "../components/GameBoard";
import { useBattle } from "../hooks/useBattle";
import { useGame } from "../hooks/useGame";
import { createPlayer } from "../gameSetup";

import { Player } from "../../game/entities/Player";
import { GameState } from "../../game/core/GameState";
import { GameStatus } from "../../game/types/enums";

import { TowerEnemyFactory } from "../../game/tower/TowerEnemyFactory";
import { createSeededRng } from "../../game/utils/random";
import { rewardByFloor } from "../../game/tower/TowerRewards";

export function TowerScreen() {
  const { actions } = useGame();
  const [floor, setFloor] = useState(() => loadStoredFloor());
  const [battleActive, setBattleActive] = useState(false);
  const [floorClears, setFloorClears] = useState<Record<number, number>>(
    {}
  );
  const [chests, setChests] = useState<
    Array<{ id: string; floor: number; type: string }>
  >([]);
  const [chestCounter, setChestCounter] = useState(1);

  const rng = useMemo(() => createSeededRng(Date.now()), []);

  // Player é persistente na run
  const player = useMemo(() => createPlayer(rng), [rng]);

  function createGameState(currentFloor: number): GameState {
    const enemyDeck = TowerEnemyFactory.createEnemy(currentFloor);
    const enemy = new Player("AI", enemyDeck, rng);

    return new GameState(
      [player, enemy],
      rng.next() > 0.5 ? 0 : 1,
      1,
      GameStatus.IN_PROGRESS,
      undefined,
      rng
    );
  }

  // Estado inicial da batalha atual
  const [initialState, setInitialState] = useState<GameState>(() =>
    createIdleState(floor, rng)
  );

  const {
    state,
    playerAttack,
    lastAiAction,
    lastCombatEvents,
    combatHistory,
    phase,
    isAiThinking,
  } = useBattle(initialState);

  const recentEvents = useMemo(
    () => combatHistory.slice(-5).reverse(),
    [combatHistory]
  );

  function formatEvent(event: (typeof combatHistory)[number]) {
    switch (event.type) {
      case "attack_declared":
        return `${event.attackerId} atacou ${event.defenderId}`;
      case "damage_applied":
        return `${event.sourceId} causou ${Math.round(event.amount)} em ${event.targetId}`;
      case "card_destroyed":
        return `${event.cardId} foi derrotada`;
      case "dot_applied":
        return `${event.sourceId} aplicou DOT em ${event.targetId}`;
      case "shield_applied":
        return `${event.targetId} recebeu escudo`;
      case "proc_triggered":
        return `${event.sourceId} ativou ${event.effect}`;
      case "round_start":
        return `Turno ${event.turn} começou`;
      default:
        return event.type;
    }
  }

  function startBattle(currentFloor: number) {
    setInitialState(createGameState(currentFloor));
    setBattleActive(true);
    actions.recordTowerRunStart();
  }

  function handleExit(nextFloor: number) {
    setFloor(nextFloor);
    saveStoredFloor(nextFloor);
    setInitialState(createIdleState(nextFloor, rng));
    setBattleActive(false);
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

  function grantTowerRewards(currentFloor: number) {
    const reward = rewardByFloor(currentFloor);
    if (reward.gold > 0) {
      actions.addCurrency("gold", reward.gold);
    }
    if (reward.blueDiamonds) {
      actions.addCurrency("diamonds", reward.blueDiamonds);
    }
    if (reward.chestId) {
      grantChest(currentFloor);
    }
  }

  const startLabel = floor > 1 ? "Continuar" : "Iniciar";

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>🏰 Torre</h1>
        <h2 style={{ margin: 0, fontSize: 18 }}>Andar {floor} / 30</h2>
      </div>

      {!battleActive ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: 16,
              padding: 24,
              minWidth: 280,
              textAlign: "center",
              boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Andar {floor} / 30</h2>
            <p style={{ color: "#666" }}>
              Prepare seu deck antes de encarar o próximo andar.
            </p>
            <button type="button" onClick={() => startBattle(floor)}>
              {startLabel} luta
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 260px",
            gap: 16,
            minHeight: 0,
          }}
        >
          <GameBoard
            state={state}
            onAttack={playerAttack}
            lastAiDefenderId={lastAiAction?.defenderId ?? null}
            lastAiAction={lastAiAction}
            lastCombatEvents={lastCombatEvents}
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
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ margin: 0, color: "#333" }}>
                    🤖 {lastAiAction.attackerId} atacou{" "}
                    {lastAiAction.defenderId}
                  </p>
                  {lastAiAction.reason && (
                    <p style={{ margin: 0, color: "#555", fontSize: 12 }}>
                      {lastAiAction.reason}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ margin: 0, color: "#666" }}>
                  {isAiThinking ? "Bot pensando..." : "Aguardando ação do bot."}
                </p>
              )}
            </div>
            <div>
              <h3 style={{ marginTop: 0 }}>🎬 Fase</h3>
              <p style={{ margin: 0, color: "#333" }}>{phase}</p>
            </div>
            <div>
              <h3 style={{ marginTop: 0 }}>📜 Últimos eventos</h3>
              {recentEvents.length === 0 ? (
                <p style={{ margin: 0, color: "#666" }}>
                  Nenhum evento ainda.
                </p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {recentEvents.map((event, index) => (
                    <li key={`${event.type}-${event.turn}-${index}`}>
                      {formatEvent(event)}
                    </li>
                  ))}
                </ul>
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
      )}

      {battleActive && state.status === GameStatus.FINISHED && (
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
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const nextFloor = floor + 1;
                      actions.recordTowerResult({ win: true, floor });
                      grantTowerRewards(floor);
                      setFloor(nextFloor);
                      startBattle(nextFloor);
                    }}
                  >
                    Continuar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextFloor = floor + 1;
                      actions.recordTowerResult({ win: true, floor });
                      grantTowerRewards(floor);
                      handleExit(nextFloor);
                    }}
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>❌ Derrota</h2>
                <button
                  type="button"
                  onClick={() => {
                    actions.recordTowerResult({ win: false, floor });
                    handleExit(1);
                  }}
                >
                  Reiniciar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function loadStoredFloor() {
  if (typeof window === "undefined") {
    return 1;
  }
  try {
    const stored = window.localStorage.getItem("tower-floor");
    const parsed = Number(stored);
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  } catch {
    return 1;
  }
}

function saveStoredFloor(floor: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("tower-floor", String(floor));
}

function createIdleState(currentFloor: number, rng: ReturnType<typeof createSeededRng>) {
  const player = createPlayer(rng);
  const enemyDeck = TowerEnemyFactory.createEnemy(currentFloor);
  const enemy = new Player("AI", enemyDeck, rng);
  return new GameState(
    [player, enemy],
    0,
    0,
    GameStatus.FINISHED,
    undefined,
    rng
  );
}
