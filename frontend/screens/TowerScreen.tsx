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
    <div style={{ padding: 20 }}>
      <h1>🏰 Torre</h1>
      <h2>Andar {floor} / 30</h2>

      <GameBoard
        state={state}
        onAttack={playerAttack}
        lastAiDefenderId={lastAiAction?.defenderId ?? null}
      />

      {lastAiAction && (
        <p style={{ marginTop: 12 }}>
          🤖 Bot atacou com {lastAiAction.attackerId} em{" "}
          {lastAiAction.defenderId}
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <h3>🎁 Baús conquistados</h3>
        {chests.length === 0 ? (
          <p>Nenhum baú ainda.</p>
        ) : (
          <ul>
            {chests.map(chest => (
              <li key={chest.id}>
                Andar {chest.floor}: {chest.type}
              </li>
            ))}
          </ul>
        )}
      </div>

      {state.status === GameStatus.FINISHED && (
        <div style={{ marginTop: 20 }}>
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
      )}
    </div>
  );
}
