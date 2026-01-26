import { type CSSProperties, useEffect, useState } from "react";
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
  kind: "normal" | "dot" | "reflect";
};

type DeathFlash = {
  ownerId: string;
};

type ImpactState = {
  cardId: string;
};

type DestroyedCardState = {
  cardId: string;
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
  isAiThinking?: boolean;
  onSkipAiDelay?: () => void;
}

export function GameBoard({
  state,
  onAttack,
  lastAiDefenderId,
  lastAiAction,
  lastCombatEvents,
  animationTimings,
  isAiThinking,
  onSkipAiDelay,
}: Props) {
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(
    null
  );
  const [selectedDefender, setSelectedDefender] = useState<string | null>(
    null
  );
  const [attackAnimation, setAttackAnimation] =
    useState<AttackAnimation | null>(null);
  const [hitTarget, setHitTarget] = useState<ImpactState | null>(null);
  const [damageFloat, setDamageFloat] = useState<DamageFloat | null>(null);
  const [deathFlash, setDeathFlash] = useState<DeathFlash | null>(null);
  const [destroyedCard, setDestroyedCard] =
    useState<DestroyedCardState | null>(null);
  const [turnCue, setTurnCue] = useState<string | null>(null);

  const player = state.players.find(p => p.id === "Player")!;
  const enemy = state.players.find(p => p.id === "AI")!;
  const isPlayerTurn = state.currentPlayer.id === "Player";
  const timings = animationTimings ?? {
    attackMs: 520,
    hitMs: 180,
    damageMs: 550,
    deathMs: 250,
  };
  const hitDelayMs = 100;
  const attackSeconds = timings.attackMs / 1000;
  const hitSeconds = timings.hitMs / 1000;
  const damageSeconds = timings.damageMs / 1000;
  const deathSeconds = timings.deathMs / 1000;

  function getExpectedDamage(cardId: string) {
    const attacker = player.field.find(card => card.id === cardId);
    if (!attacker) return null;
    const expected = attacker.power * (1 + attacker.buffPowerPctTotal);
    return Math.round(expected);
  }

  function getDamageAppearance(damage: DamageFloat) {
    const base = Math.round(damage.amount);
    const isHeavy = base >= 160;
    if (damage.kind === "dot") {
      return {
        label: `-${base} DOT`,
        color: "#7b1fa2",
        size: isHeavy ? 16 : 13,
      };
    }
    if (damage.kind === "reflect") {
      return {
        label: `-${base} REF`,
        color: "#0288d1",
        size: isHeavy ? 16 : 13,
      };
    }
    return {
      label: `-${base}`,
      color: "#e53935",
      size: isHeavy ? 18 : 14,
    };
  }

  useEffect(() => {
    if (!isPlayerTurn) {
      setSelectedAttacker(null);
      setSelectedDefender(null);
    }
  }, [isPlayerTurn]);

  useEffect(() => {
    setTurnCue(isPlayerTurn ? "PRONTO" : "AGUARDE");
    const readyTimeout = window.setTimeout(() => {
      setTurnCue(isPlayerTurn ? "VAI!" : "JOGADA!");
    }, 300);
    const clearTimeoutId = window.setTimeout(() => {
      setTurnCue(null);
    }, 900);
    return () => {
      window.clearTimeout(readyTimeout);
      window.clearTimeout(clearTimeoutId);
    };
  }, [isPlayerTurn, state.turn]);

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

      const hitDelayTimeout = window.setTimeout(() => {
        setHitTarget({ cardId: attackEvent.defenderId });
      }, timings.attackMs + hitDelayMs);

      const attackTimeout = window.setTimeout(() => {
        setAttackAnimation(null);
      }, timings.attackMs);

      const hitTimeout = window.setTimeout(() => {
        setHitTarget(null);
      }, timings.attackMs + hitDelayMs + timings.hitMs);

      return () => {
        window.clearTimeout(hitDelayTimeout);
        window.clearTimeout(attackTimeout);
        window.clearTimeout(hitTimeout);
      };
    }

    return undefined;
  }, [lastCombatEvents, timings.attackMs, timings.hitMs]);

  useEffect(() => {
    if (!lastCombatEvents || lastCombatEvents.length === 0) return;

    const damageEvent = lastCombatEvents.find(
      event => event.type === "damage_applied"
    ) as CombatEvent | undefined;
    if (!damageEvent || damageEvent.type !== "damage_applied") return;
    const lastAttack = lastCombatEvents.find(
      event => event.type === "attack_declared"
    ) as CombatEvent | undefined;
    const isReflect =
      !!lastAttack &&
      lastAttack.type === "attack_declared" &&
      damageEvent.targetId === lastAttack.attackerId &&
      damageEvent.sourceId === lastAttack.defenderId;
    const kind = damageEvent.isDot ? "dot" : isReflect ? "reflect" : "normal";
    setDamageFloat({
      cardId: damageEvent.targetId,
      amount: damageEvent.amount,
      kind,
    });

    const damageTimeout = window.setTimeout(() => {
      setDamageFloat(null);
    }, timings.damageMs);

    return () => window.clearTimeout(damageTimeout);
  }, [lastCombatEvents, timings.damageMs]);

  useEffect(() => {
    if (!lastCombatEvents || lastCombatEvents.length === 0) return;

    const destroyEvent = lastCombatEvents.find(
      event => event.type === "card_destroyed"
    ) as CombatEvent | undefined;
    if (!destroyEvent || destroyEvent.type !== "card_destroyed") return;

    setDeathFlash({ ownerId: destroyEvent.ownerId });
    setDestroyedCard({ cardId: destroyEvent.cardId });

    const deathTimeout = window.setTimeout(() => {
      setDeathFlash(null);
    }, timings.deathMs);

    const destroyTimeout = window.setTimeout(() => {
      setDestroyedCard(null);
    }, timings.deathMs + 200);

    return () => {
      window.clearTimeout(deathTimeout);
      window.clearTimeout(destroyTimeout);
    };
  }, [lastCombatEvents, timings.deathMs]);

  const focusTargetIds = [
    attackAnimation?.attackerId,
    attackAnimation?.defenderId,
    hitTarget?.cardId,
  ].filter(Boolean) as string[];
  const focusActive = focusTargetIds.length > 0;

  useEffect(() => {
    if (!lastCombatEvents || lastCombatEvents.length === 0) return;
    if (typeof window === "undefined") return;

    const audioContext =
      (window as Window & { _battleAudio?: AudioContext })._battleAudio ??
      new AudioContext();
    (window as Window & { _battleAudio?: AudioContext })._battleAudio =
      audioContext;

    function playTone(frequency: number, durationMs: number, gainValue: number) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "triangle";
      gain.gain.value = gainValue;
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + durationMs / 1000);
    }

    if (lastCombatEvents.some(event => event.type === "attack_declared")) {
      playTone(480, 90, 0.04);
    }
    const damageEvent = lastCombatEvents.find(
      event => event.type === "damage_applied"
    ) as CombatEvent | undefined;
    if (damageEvent && damageEvent.type === "damage_applied") {
      const attackEvent = lastCombatEvents.find(
        event => event.type === "attack_declared"
      ) as CombatEvent | undefined;
      const isReflect =
        !!attackEvent &&
        attackEvent.type === "attack_declared" &&
        damageEvent.targetId === attackEvent.attackerId &&
        damageEvent.sourceId === attackEvent.defenderId;
      if (damageEvent.isDot) {
        playTone(320, 120, 0.04);
      } else if (isReflect) {
        playTone(560, 120, 0.05);
      } else {
        playTone(220, 100, 0.05);
      }
    }
    if (lastCombatEvents.some(event => event.type === "card_destroyed")) {
      playTone(140, 160, 0.06);
    }
  }, [lastCombatEvents]);

  return (
    <div
      onClick={() => {
        if (isAiThinking) {
          onSkipAiDelay?.();
        }
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        padding: "var(--space-2)",
        borderRadius: 16,
        background: "#f7f7f7",
        border: "1px solid #e0e0e0",
        height: "100%",
        position: "relative",
        cursor: isAiThinking ? "pointer" : "default",
      }}
    >
      <style>{`
        @keyframes ready-pulse {
          0% { opacity: 0; transform: scale(0.9); }
          30% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.1); }
        }
        @keyframes attack-swing-player {
          0% { transform: translateY(0) scale(1); }
          60% { transform: translateY(-28px) scale(1.06); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes attack-swing-enemy {
          0% { transform: translateY(0) scale(1); }
          60% { transform: translateY(28px) scale(1.06); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes attack-hit {
          0% { transform: translateX(0) scale(1); box-shadow: 0 0 0 rgba(255, 82, 82, 0); }
          50% { transform: translateX(-6px) scale(0.98); box-shadow: 0 0 16px rgba(255, 82, 82, 0.55); }
          100% { transform: translateX(0) scale(1); box-shadow: 0 0 0 rgba(255, 82, 82, 0); }
        }
        @keyframes impact-flash {
          0% { opacity: 0; transform: scale(0.9); }
          30% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0; transform: scale(1.05); }
        }
        @keyframes damage-float {
          0% { opacity: 0; transform: translateY(0); }
          20% { opacity: 1; transform: translateY(-8px); }
          100% { opacity: 0; transform: translateY(-28px); }
        }
        @keyframes card-ready {
          0% { transform: translateY(0); box-shadow: 0 0 0 rgba(64, 195, 255, 0); }
          50% { transform: translateY(-4px); box-shadow: 0 0 12px rgba(64, 195, 255, 0.4); }
          100% { transform: translateY(0); box-shadow: 0 0 0 rgba(64, 195, 255, 0); }
        }
        @keyframes hit-shake {
          0% { transform: translateX(0); }
          30% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        @keyframes death-flash {
          0% { opacity: 0; transform: scale(0.6); }
          40% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1); }
        }
        @keyframes card-fade-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.92); }
        }
        @keyframes spark-burst {
          0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--spark-x), var(--spark-y)) scale(1); }
        }
        .turn-cue {
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(16, 24, 40, 0.9);
          color: #fff;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 0.6px;
          animation: ready-pulse 0.9s ease;
          z-index: 10;
          pointer-events: none;
        }
        .attack-swing-player {
          animation: attack-swing-player ${attackSeconds}s ease-in-out;
        }
        .attack-swing-enemy {
          animation: attack-swing-enemy ${attackSeconds}s ease-in-out;
        }
        .attack-hit {
          animation: attack-hit ${hitSeconds}s ease-out;
        }
        .attacker-glow {
          box-shadow: 0 0 18px rgba(66, 165, 245, 0.65);
          border-radius: 10px;
        }
        .defender-glow {
          box-shadow: 0 0 18px rgba(255, 112, 67, 0.75);
          border-radius: 10px;
        }
        .impact-flash {
          position: absolute;
          inset: -6px;
          border-radius: 10px;
          border: 2px solid rgba(255, 214, 10, 0.9);
          box-shadow: 0 0 20px rgba(255, 214, 10, 0.7);
          animation: impact-flash 0.16s ease-out;
          pointer-events: none;
        }
        .damage-float {
          animation: damage-float ${damageSeconds}s ease-out;
        }
        .card-ready {
          animation: card-ready 1.6s ease-in-out infinite;
        }
        .hit-shake {
          animation: hit-shake 0.2s ease-in-out;
        }
        .death-flash {
          animation: death-flash ${deathSeconds}s ease-out;
        }
        .card-fade-out {
          animation: card-fade-out 0.3s ease-out forwards;
        }
        .spark {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ffd54f;
          box-shadow: 0 0 6px rgba(255, 213, 79, 0.8);
          animation: spark-burst 0.25s ease-out;
          pointer-events: none;
        }
      `}</style>
      {turnCue && <div className="turn-cue">{turnCue}</div>}
      <p>
        Turno {state.turn} ·{" "}
        {isPlayerTurn ? "Sua vez!" : "Vez do inimigo..."}
      </p>
      <div
        style={{
          padding: "var(--space-2)",
          borderRadius: 16,
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
            gap: "var(--space-2)",
          }}
        >
          <h2>🤖 Cartas do Inimigo</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <span
              style={{
                background: "#101828",
                color: "#fff",
                padding: "var(--space-1) var(--space-2)",
                borderRadius: 999,
                fontSize: 12,
                alignSelf: "flex-end",
              }}
            >
              {lastAiAction
                ? `⚔️ ${lastAiAction.attackerId} → ${lastAiAction.defenderId}`
                : isAiThinking
                  ? "⏳ Bot pensando..."
                  : "⏳ Aguardando jogada"}
            </span>
            {lastAiAction?.reason && (
              <span style={{ fontSize: 11, color: "#555", textAlign: "right" }}>
                {lastAiAction.reason}
              </span>
            )}
            {isAiThinking && (
              <span style={{ fontSize: 11, color: "#888", textAlign: "right" }}>
                Clique para pular
              </span>
            )}
          </div>
          <div
            style={{
              width: 72,
              height: 104,
              border: "1px solid #bbb",
              borderRadius: 8,
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
                right: "var(--space-2)",
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              💀 {destroyedCard?.cardId ?? "Carta destruída"}
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
            const isDefender = hitTarget?.cardId === card.id;
            const isFocusTarget = focusTargetIds.includes(card.id);
            const focusOpacity = focusActive && !isFocusTarget ? 0.35 : 1;
            const animationClass = [
              isAttacking ? "attack-swing-enemy" : "",
              isDefender ? "attack-hit hit-shake defender-glow" : "",
              isAttacking ? "attacker-glow" : "",
              destroyedCard?.cardId === card.id ? "card-fade-out" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const showDamage = damageFloat?.cardId === card.id;
            const damageAppearance =
              showDamage && damageFloat ? getDamageAppearance(damageFloat) : null;

            return (
              <div
                key={card.id}
                style={{ opacity: opacity * focusOpacity, position: "relative" }}
                className={animationClass}
                title={
                  selectedAttacker
                    ? `Dano esperado: ${getExpectedDamage(selectedAttacker) ?? "-"}`
                    : undefined
                }
              >
                {isDefender && (
                  <>
                    <span className="impact-flash" />
                    <span
                      className="spark"
                      style={{ "--spark-x": "-14px", "--spark-y": "-10px" } as CSSProperties}
                    />
                    <span
                      className="spark"
                      style={{ "--spark-x": "10px", "--spark-y": "-16px" } as CSSProperties}
                    />
                    <span
                      className="spark"
                      style={{ "--spark-x": "16px", "--spark-y": "12px" } as CSSProperties}
                    />
                  </>
                )}
                {showDamage && (
                  <div
                    className="damage-float"
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 10,
                      zIndex: 4,
                      fontWeight: 700,
                      color: damageAppearance?.color ?? "#e53935",
                      fontSize: damageAppearance?.size ?? 14,
                      textShadow: "0 2px 6px rgba(0,0,0,0.35)",
                      pointerEvents: "none",
                    }}
                  >
                    {damageAppearance?.label ?? `-${Math.round(damageFloat.amount)}`}
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
          padding: "var(--space-2)",
          borderRadius: 16,
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>🧑‍🎮 Suas Cartas</h2>
          <div
            style={{
              width: 72,
              height: 104,
              border: "1px solid #bbb",
              borderRadius: 8,
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
                right: "var(--space-2)",
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                padding: "var(--space-1) var(--space-2)",
                borderRadius: 999,
                fontSize: 12,
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              💀 {destroyedCard?.cardId ?? "Carta destruída"}
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
            const isDefender = hitTarget?.cardId === card.id;
            const isFocusTarget = focusTargetIds.includes(card.id);
            const focusOpacity = focusActive && !isFocusTarget ? 0.35 : 1;
            const animationClass = [
              isAttacking ? "attack-swing-player" : "",
              isDefender ? "attack-hit hit-shake defender-glow" : "",
              isAttacking ? "attacker-glow" : "",
              isPlayerTurn ? "card-ready" : "",
              destroyedCard?.cardId === card.id ? "card-fade-out" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const showDamage = damageFloat?.cardId === card.id;
            const damageAppearance =
              showDamage && damageFloat ? getDamageAppearance(damageFloat) : null;

            return (
              <div
                key={card.id}
                style={{ opacity: opacity * focusOpacity, position: "relative" }}
                className={animationClass}
              >
                {isDefender && (
                  <>
                    <span className="impact-flash" />
                    <span
                      className="spark"
                      style={{ "--spark-x": "-12px", "--spark-y": "-8px" } as CSSProperties}
                    />
                    <span
                      className="spark"
                      style={{ "--spark-x": "12px", "--spark-y": "-14px" } as CSSProperties}
                    />
                    <span
                      className="spark"
                      style={{ "--spark-x": "18px", "--spark-y": "10px" } as CSSProperties}
                    />
                  </>
                )}
                {showDamage && (
                  <div
                    className="damage-float"
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 10,
                      zIndex: 4,
                      fontWeight: 700,
                      color: damageAppearance?.color ?? "#e53935",
                      fontSize: damageAppearance?.size ?? 14,
                      textShadow: "0 2px 6px rgba(0,0,0,0.35)",
                      pointerEvents: "none",
                    }}
                  >
                    {damageAppearance?.label ?? `-${Math.round(damageFloat.amount)}`}
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
