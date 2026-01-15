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

  const { state, playerAttack } = useGame(initialState);

  function retryFloor() {
    setInitialState(createGameState(floor));
  }

  function nextFloor() {
    const next = floor + 1;
    setFloor(next);
    setInitialState(createGameState(next));
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🏰 Torre</h1>
      <h2>Andar {floor} / 30</h2>

      <GameBoard state={state} onAttack={playerAttack} />

      {state.status === GameStatus.FINISHED && (
        <div style={{ marginTop: 20 }}>
          {state.winnerId === "Player" ? (
            <>
              <h2>✅ Vitória!</h2>
              <button onClick={nextFloor}>Próximo andar</button>
            </>
          ) : (
            <>
              <h2>❌ Derrota</h2>
              <button onClick={retryFloor}>Tentar novamente</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
