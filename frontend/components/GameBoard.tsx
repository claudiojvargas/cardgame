import { useEffect, useState } from "react";
import { GameState } from "../../game/core/GameState";
import { CardTile } from "./CardTile";
import { CombatEvent } from "../../game/core/CombatLog";

type AttackAnimation = {
  attackerId: string;
  defenderId: string;
};

type DamageFloat = {
  cardId: string;
  amount: number;
};

type DeathFlash = {
  ownerId: string;
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
  animationTimings?: {
    attackMs: number;
    hitMs: number;
    damageMs: number;
    deathMs: number;
  };
}

export function GameBoard({
  state,
  onAttack,
  lastAiDefenderId,
  lastAiAction,
  lastCombatEvents,
  animationTimings,
}: Props) {
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(
    null
  );
  const [selectedDefender, setSelectedDefender] = useState<string | null>(
    null
  );
  const [attackAnimation, setAttackAnimation] =
    useState<AttackAnimation | null>(null);
  const [damageFloat, setDamageFloat] = useState<DamageFloat | null>(null);
  const [deathFlash, setDeathFlash] = useState<DeathFlash | null>(null);

  const player = state.players.find(p => p.id === "Player")!;
  const enemy = state.players.find(p => p.id === "AI")!;
  const isPlayerTurn = state.currentPlayer.id === "Player";
  const timings = animationTimings ?? {
    attackMs: 520,
    hitMs: 180,
    damageMs: 550,
    deathMs: 250,
  };
  const attackSeconds = timings.attackMs / 1000;
  const hitSeconds = timings.hitMs / 1000;
  const damageSeconds = timings.damageMs / 1000;
  const deathSeconds = timings.deathMs / 1000;

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
    if (attackEvent && attackEvent.type === "attack_declared") {
      setAttackAnimation({
        attackerId: attackEvent.attackerId,
        defenderId: attackEvent.defenderId,
      });

      const attackTimeout = window.setTimeout(() => {
        setAttackAnimation(null);
      }, timings.attackMs);

      return () => window.clearTimeout(attackTimeout);
    }

    return undefined;
  }, [lastCombatEvents]);

  useEffect(() => {
    if (!lastCombatEvents || lastCombatEvents.length === 0) return;

    const damageEvent = lastCombatEvents.find(
      event => event.type === "damage_applied"
    ) as CombatEvent | undefined;
    if (!damageEvent || damageEvent.type !== "damage_applied") return;

    setDamageFloat({
      cardId: damageEvent.targetId,
      amount: damageEvent.amount,
    });

    const damageTimeout = window.setTimeout(() => {
      setDamageFloat(null);
    }, timings.damageMs);

    return () => window.clearTimeout(damageTimeout);
  }, [lastCombatEvents]);

  useEffect(() => {
    if (!lastCombatEvents || lastCombatEvents.length === 0) return;

    const destroyEvent = lastCombatEvents.find(
      event => event.type === "card_destroyed"
    ) as CombatEvent | undefined;
    if (!destroyEvent || destroyEvent.type !== "card_destroyed") return;

    setDeathFlash({ ownerId: destroyEvent.ownerId });

    const deathTimeout = window.setTimeout(() => {
      setDeathFlash(null);
    }, timings.deathMs);

    return () => window.clearTimeout(deathTimeout);
  }, [lastCombatEvents]);

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
          60% { transform: translateY(-18px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes attack-swing-enemy {
          0% { transform: translateY(0) scale(1); }
          60% { transform: translateY(18px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes attack-hit {
          0% { transform: translateX(0) scale(1); box-shadow: 0 0 0 rgba(255, 82, 82, 0); }
          50% { transform: translateX(-6px) scale(0.98); box-shadow: 0 0 16px rgba(255, 82, 82, 0.55); }
          100% { transform: translateX(0) scale(1); box-shadow: 0 0 0 rgba(255, 82, 82, 0); }
        }
        @keyframes damage-float {
          0% { opacity: 0; transform: translateY(0); }
          20% { opacity: 1; transform: translateY(-8px); }
          100% { opacity: 0; transform: translateY(-28px); }
        }
        @keyframes death-flash {
          0% { opacity: 0; transform: scale(0.6); }
          40% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1); }
        }
        .attack-swing-player {
          animation: attack-swing-player ${attackSeconds}s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .attack-swing-enemy {
          animation: attack-swing-enemy ${attackSeconds}s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .attack-hit {
          animation: attack-hit ${hitSeconds}s ease-out;
        }
        .damage-float {
          animation: damage-float ${damageSeconds}s ease-out;
        }
        .death-flash {
          animation: death-flash ${deathSeconds}s ease-out;
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
        <div style={{ display: "flex", flexWrap: "wrap", position: "relative" }}>
          {deathFlash?.ownerId === "AI" && (
            <div
              className="death-flash"
              style={{
                position: "absolute",
                top: -8,
                right: 12,
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              💀 Carta destruída
            </div>
          )}
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
            const showDamage = damageFloat?.cardId === card.id;

            return (
              <div
                key={card.id}
                style={{ opacity, position: "relative" }}
                className={animationClass}
              >
                {showDamage && (
                  <div
                    className="damage-float"
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 10,
                      zIndex: 4,
                      fontWeight: 700,
                      color: "#e53935",
                      textShadow: "0 2px 6px rgba(0,0,0,0.35)",
                      pointerEvents: "none",
                    }}
                  >
                    -{Math.round(damageFloat.amount)}
                  </div>
                )}
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
        <div style={{ display: "flex", flexWrap: "wrap", position: "relative" }}>
          {deathFlash?.ownerId === "Player" && (
            <div
              className="death-flash"
              style={{
                position: "absolute",
                top: -8,
                right: 12,
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              💀 Carta destruída
            </div>
          )}
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
            const showDamage = damageFloat?.cardId === card.id;

            return (
              <div
                key={card.id}
                style={{ opacity, position: "relative" }}
                className={animationClass}
              >
                {showDamage && (
                  <div
                    className="damage-float"
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 10,
                      zIndex: 4,
                      fontWeight: 700,
                      color: "#e53935",
                      textShadow: "0 2px 6px rgba(0,0,0,0.35)",
                      pointerEvents: "none",
                    }}
                  >
                    -{Math.round(damageFloat.amount)}
                  </div>
                )}
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
