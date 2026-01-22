import { useEffect, useState } from "react";
import { GameState } from "../../game/core/GameState";
import { CardTile } from "./CardTile";
import { CombatEvent } from "../../game/core/CombatLog";

type AttackAnimation = {
  attackerId: string;
  defenderId: string;
  side: "player" | "enemy";
};

interface Props {
  state: GameState;
  onAttack: (attackerId: string, defenderId: string) => void;
  lastAiDefenderId?: string | null;
  lastAiAction?: {
    attackerId: string;
    defenderId: string;
    reason?: string;
  } | null;
  lastCombatEvents?: CombatEvent[];
}

export function GameBoard({
  state,
  onAttack,
  lastAiDefenderId,
  lastAiAction,
  lastCombatEvents,
}: Props) {
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(
    null
  );
  const [selectedDefender, setSelectedDefender] = useState<string | null>(
    null
  );
  const [attackAnimation, setAttackAnimation] =
    useState<AttackAnimation | null>(null);

  const player = state.players.find(p => p.id === "Player")!;
  const enemy = state.players.find(p => p.id === "AI")!;
  const isPlayerTurn = state.currentPlayer.id === "Player";

  useEffect(() => {
    if (!isPlayerTurn) {
      setSelectedAttacker(null);
      setSelectedDefender(null);
    }
  }, [isPlayerTurn]);

  useEffect(() => {
    if (!lastCombatEvents || lastCombatEvents.length === 0) return;

    const attackEvent = lastCombatEvents.find(
      event => event.type === "attack_declared"
    ) as CombatEvent | undefined;
    if (!attackEvent || attackEvent.type !== "attack_declared") return;

    const side = player.field.some(card => card.id === attackEvent.attackerId)
      ? "player"
      : "enemy";

    setAttackAnimation({
      attackerId: attackEvent.attackerId,
      defenderId: attackEvent.defenderId,
      side,
    });

    const timeoutId = window.setTimeout(() => {
      setAttackAnimation(null);
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [lastCombatEvents, player.field]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
        borderRadius: 12,
        background: "#f7f7f7",
        border: "1px solid #e0e0e0",
        height: "100%",
      }}
    >
      <style>{`
        @keyframes attack-swing-player {
          0% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-18px) scale(1.05); }
          70% { transform: translateY(-6px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes attack-swing-enemy {
          0% { transform: translateY(0) scale(1); }
          40% { transform: translateY(18px) scale(1.05); }
          70% { transform: translateY(6px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes attack-hit {
          0% { transform: translateX(0) scale(1); box-shadow: 0 0 0 rgba(255, 82, 82, 0); }
          30% { transform: translateX(-6px) scale(0.98); box-shadow: 0 0 16px rgba(255, 82, 82, 0.55); }
          60% { transform: translateX(6px) scale(1.02); box-shadow: 0 0 20px rgba(255, 82, 82, 0.45); }
          100% { transform: translateX(0) scale(1); box-shadow: 0 0 0 rgba(255, 82, 82, 0); }
        }
        .attack-swing-player {
          animation: attack-swing-player 0.6s ease;
        }
        .attack-swing-enemy {
          animation: attack-swing-enemy 0.6s ease;
        }
        .attack-hit {
          animation: attack-hit 0.5s ease;
        }
      `}</style>
      <p>
        Turno {state.turn} ·{" "}
        {isPlayerTurn ? "Sua vez!" : "Vez do inimigo..."}
      </p>
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h2>🤖 Cartas do Inimigo</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                background: "#101828",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                alignSelf: "flex-end",
              }}
            >
              {lastAiAction
                ? `⚔️ ${lastAiAction.attackerId} → ${lastAiAction.defenderId}`
                : "⏳ Aguardando jogada"}
            </span>
            {lastAiAction?.reason && (
              <span style={{ fontSize: 11, color: "#555", textAlign: "right" }}>
                {lastAiAction.reason}
              </span>
            )}
          </div>
          <div
            style={{
              width: 70,
              height: 100,
              border: "1px solid #bbb",
              borderRadius: 6,
              background: "#e9e9e9",
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
            const isAttacking = attackAnimation?.attackerId === card.id;
            const isDefender = attackAnimation?.defenderId === card.id;
            const animationClass = isAttacking
              ? "attack-swing-enemy"
              : isDefender
                ? "attack-hit"
                : "";

            return (
              <div
                key={card.id}
                style={{ opacity }}
                className={animationClass}
              >
                <CardTile
                  card={card}
                  obtained
                  selectable={selectable}
                  onClick={() => {
                    if (selectedAttacker && isPlayerTurn) {
                      setSelectedDefender(card.id);
                      onAttack(selectedAttacker, card.id);
                      setSelectedAttacker(null);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>🧑‍🎮 Suas Cartas</h2>
          <div
            style={{
              width: 70,
              height: 100,
              border: "1px solid #bbb",
              borderRadius: 6,
              background: "#e9e9e9",
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
            const isAttacking = attackAnimation?.attackerId === card.id;
            const isDefender = attackAnimation?.defenderId === card.id;
            const animationClass = isAttacking
              ? "attack-swing-player"
              : isDefender
                ? "attack-hit"
                : "";

            return (
              <div
                key={card.id}
                style={{ opacity }}
                className={animationClass}
              >
                <CardTile
                  card={card}
                  obtained
                  selectable={selectable}
                  onClick={() => {
                    if (!isPlayerTurn) return;
                    setSelectedAttacker(card.id);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
