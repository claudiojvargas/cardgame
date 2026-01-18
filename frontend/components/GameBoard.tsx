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

  return (
    <div>
      <p>
        Turno {state.turn} ·{" "}
        {isPlayerTurn ? "Sua vez!" : "Vez do inimigo..."}
      </p>
      <h2>Enemy</h2>
      <div style={{ display: "flex" }}>
        {enemy.field.map(card => (
          <CardView
            key={card.id}
            card={card}
            selectable={!!selectedAttacker && isPlayerTurn}
            onClick={() => {
              if (selectedAttacker && isPlayerTurn) {
                onAttack(selectedAttacker, card.id);
                setSelectedAttacker(null);
              }
            }}
          />
        ))}
      </div>

      <hr />

      <h2>Your Cards</h2>
      <div style={{ display: "flex" }}>
        {player.field.map(card => (
          <CardView
            key={card.id}
            card={card}
            selectable={isPlayerTurn}
            onClick={() => {
              if (!isPlayerTurn) return;
              setSelectedAttacker(card.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
