import { useState } from "react";
import { GameState } from "../../game/core/GameState";
import { CardView } from "./CardView";

interface Props {
  state: GameState;
  onAttack: (attackerId: string, defenderId: string) => void;
}

export function GameBoard({ state, onAttack }: Props) {
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(
    null
  );

  const player = state.players.find(p => p.id === "Player")!;
  const enemy = state.players.find(p => p.id === "AI")!;
  const isPlayerTurn = state.currentPlayer.id === "Player";
  const shouldDimEnemyCards = isPlayerTurn;
  const shouldDimPlayerCards = !isPlayerTurn;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <p>
        Turno {state.turn} ·{" "}
        {isPlayerTurn ? "Sua vez!" : "Vez do inimigo..."}
      </p>
      <div>
        <h2>🤖 Cartas do Inimigo</h2>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {enemy.field.map(card => {
            const selectable = !!selectedAttacker && isPlayerTurn;
            const opacity = shouldDimEnemyCards && !selectable ? 0.4 : 1;

            return (
              <CardView
                key={card.id}
                card={card}
                selectable={selectable}
                onClick={() => {
                  if (selectedAttacker && isPlayerTurn) {
                    onAttack(selectedAttacker, card.id);
                    setSelectedAttacker(null);
                  }
                }}
                style={{
                  background: "#f7c6c6",
                  color: "#999",
                  opacity,
                }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <h2>🧑‍🎮 Suas Cartas</h2>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {player.field.map(card => {
            const selectable = isPlayerTurn;
            const opacity = shouldDimPlayerCards ? 0.4 : 1;

            return (
              <CardView
                key={card.id}
                card={card}
                selectable={selectable}
                onClick={() => {
                  if (!isPlayerTurn) return;
                  setSelectedAttacker(card.id);
                }}
                style={{
                  background: "#cfe4ff",
                  color: "#999",
                  opacity,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
