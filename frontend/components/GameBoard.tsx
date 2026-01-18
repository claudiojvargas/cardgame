import { useEffect, useState } from "react";
import { GameState } from "../../game/core/GameState";
import { CardView } from "./CardView";

interface Props {
  state: GameState;
  onAttack: (attackerId: string, defenderId: string) => void;
  lastAiDefenderId?: string | null;
}

export function GameBoard({ state, onAttack, lastAiDefenderId }: Props) {
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(
    null
  );
  const [selectedDefender, setSelectedDefender] = useState<string | null>(
    null
  );

  const player = state.players.find(p => p.id === "Player")!;
  const enemy = state.players.find(p => p.id === "AI")!;
  const isPlayerTurn = state.currentPlayer.id === "Player";

  useEffect(() => {
    if (!isPlayerTurn) {
      setSelectedAttacker(null);
      setSelectedDefender(null);
    }
  }, [isPlayerTurn]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <p>
        Turno {state.turn} ·{" "}
        {isPlayerTurn ? "Sua vez!" : "Vez do inimigo..."}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>🤖 Cartas do Inimigo</h2>
        <div
          style={{
            width: 70,
            height: 100,
            border: "1px solid #555",
            borderRadius: 6,
            background: "#222",
            alignSelf: "flex-start",
          }}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {enemy.field.map(card => {
          const selectable = !!selectedAttacker && isPlayerTurn;
          const opacity =
            isPlayerTurn
              ? selectedDefender
                ? card.id === selectedDefender
                  ? 1
                  : 0.4
                : 0.4
              : 1;

          return (
            <CardView
              key={card.id}
              card={card}
              selectable={selectable}
              onClick={() => {
                if (selectedAttacker && isPlayerTurn) {
                  setSelectedDefender(card.id);
                  onAttack(selectedAttacker, card.id);
                  setSelectedAttacker(null);
                }
              }}
              style={{
                background: "#f7c6c6",
                color: "#000",
                opacity,
              }}
            />
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>🧑‍🎮 Suas Cartas</h2>
        <div
          style={{
            width: 70,
            height: 100,
            border: "1px solid #555",
            borderRadius: 6,
            background: "#222",
            alignSelf: "flex-start",
          }}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {player.field.map(card => {
          const selectable = isPlayerTurn;
          const opacity =
            !isPlayerTurn && lastAiDefenderId
              ? card.id === lastAiDefenderId
                ? 1
                : 0.4
              : !isPlayerTurn
                ? 0.4
                : 1;

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
                color: "#000",
                opacity,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
