import { useEffect, useMemo, useState } from "react";
import { GameState } from "../../game/core/GameState";
import { BattleResolver } from "../../game/core/BattleResolver";
import { GameStatus } from "../../game/types/enums";
import { SimpleAIAgent } from "../../game/ai/SimpleAIAgent";
import { AIDifficulty } from "../../game/ai/AIDifficulty";
import type { IAgent } from "../../game/ai/IAgent";
import { CombatEvent } from "../../game/core/CombatLog";

export type GamePhase =
  | "PLAYER_TURN"
  | "AI_TURN"
  | "ANIMATING"
  | "GAME_OVER";

export function useBattle(initialState: GameState, agent?: IAgent) {
  const [state, setState] = useState<GameState>(initialState);
  const [lastAiAction, setLastAiAction] = useState<{
    attackerId: string;
    defenderId: string;
    reason?: string;
  } | null>(null);
  const [lastCombatEvents, setLastCombatEvents] = useState<CombatEvent[]>([]);
  const [combatHistory, setCombatHistory] = useState<CombatEvent[]>([]);
  const [phase, setPhase] = useState<GamePhase>("PLAYER_TURN");

  const ai = useMemo(
    () => agent ?? new SimpleAIAgent(AIDifficulty.NORMAL),
    [agent]
  );

  useEffect(() => {
    setState(initialState);
    setLastAiAction(null);
    setLastCombatEvents([]);
    setCombatHistory([]);
  }, [initialState]);

  useEffect(() => {
    if (state.status !== GameStatus.IN_PROGRESS) {
      setPhase("GAME_OVER");
      return;
    }

    if (state.currentPlayer.id === "AI") {
      setPhase("AI_TURN");
    } else {
      setPhase("PLAYER_TURN");
    }
  }, [state]);

  useEffect(() => {
    if (state.status !== GameStatus.IN_PROGRESS) return;
    if (state.currentPlayer.id !== "AI") return;

    const decision = ai.decide(state);
    const result = BattleResolver.resolveAttackWithLog(
      state,
      decision.attackerId,
      decision.defenderId
    );
    setLastAiAction(decision);
    setLastCombatEvents(result.events);
    setCombatHistory(prev => [...prev, ...result.events]);
    setState(result.state);
  }, [ai, state]);

  function playerAttack(attackerId: string, defenderId: string) {
    if (state.status !== GameStatus.IN_PROGRESS) return;
    if (state.currentPlayer.id !== "Player") return;

    const result = BattleResolver.resolveAttackWithLog(
      state,
      attackerId,
      defenderId
    );

    setLastAiAction(null);
    setLastCombatEvents(result.events);
    setCombatHistory(prev => [...prev, ...result.events]);
    setState(result.state);
  }

  return {
    state,
    playerAttack,
    lastAiAction,
    lastCombatEvents,
    combatHistory,
    phase,
  };
}
