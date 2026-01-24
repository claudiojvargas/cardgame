import { useEffect, useMemo, useRef, useState } from "react";
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

export type BattleOptions = {
  aiDelayMs?: number;
};

const DEFAULT_AI_DELAY_MS = 2600;

export function useBattle(
  initialState: GameState,
  agent?: IAgent,
  options?: BattleOptions
) {
  const [state, setState] = useState<GameState>(initialState);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastAiDurationMs, setLastAiDurationMs] = useState<number | null>(null);
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
  const aiDelayMs = options?.aiDelayMs ?? DEFAULT_AI_DELAY_MS;
  const aiTimeoutRef = useRef<number | null>(null);
  const aiStartRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const aiRef = useRef(ai);

  useEffect(() => {
    setState(initialState);
    setLastAiAction(null);
    setLastCombatEvents([]);
    setCombatHistory([]);
    setIsAiThinking(false);
    setLastAiDurationMs(null);
  }, [initialState]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    aiRef.current = ai;
  }, [ai]);

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

  function resolveAiTurn() {
    const currentState = stateRef.current;
    if (currentState.status !== GameStatus.IN_PROGRESS) {
      setIsAiThinking(false);
      return;
    }
    if (currentState.currentPlayer.id !== "AI") {
      setIsAiThinking(false);
      return;
    }

    const decision = aiRef.current.decide(currentState);
    const result = BattleResolver.resolveAttackWithLog(
      currentState,
      decision.attackerId,
      decision.defenderId
    );
    setLastAiAction(decision);
    setLastCombatEvents(result.events);
    setCombatHistory(prev => [...prev, ...result.events]);
    setState(result.state);
    if (aiStartRef.current) {
      setLastAiDurationMs(Math.round(performance.now() - aiStartRef.current));
    }
    setIsAiThinking(false);
  }

  function skipAiTurn() {
    if (!isAiThinking) return;
    if (aiTimeoutRef.current) {
      window.clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    resolveAiTurn();
  }

  useEffect(() => {
    if (state.status !== GameStatus.IN_PROGRESS) return;
    if (state.currentPlayer.id !== "AI") return;

    setIsAiThinking(true);
    aiStartRef.current = performance.now();
    aiTimeoutRef.current = window.setTimeout(resolveAiTurn, aiDelayMs);

    return () => {
      if (aiTimeoutRef.current) {
        window.clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    };
  }, [aiDelayMs, state]);

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
    isAiThinking,
    lastAiDurationMs,
    skipAiTurn,
  };
}
