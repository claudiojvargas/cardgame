import { useEffect, useMemo, useState } from "react";
import { GameState } from "../../game/core/GameState";
import { BattleResolver } from "../../game/core/BattleResolver";
import { GameStatus } from "../../game/types/enums";
import { SimpleAIAgent } from "../../game/ai/SimpleAIAgent";
import { AIDifficulty } from "../../game/ai/AIDifficulty";

export function useGame(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState);
  const [lastAiAction, setLastAiAction] = useState<{
    attackerId: string;
    defenderId: string;
  } | null>(null);

  const ai = useMemo(() => new SimpleAIAgent(AIDifficulty.NORMAL), []);

  useEffect(() => {
    setState(initialState);
    setLastAiAction(null);
  }, [initialState]);

  useEffect(() => {
    if (state.status !== GameStatus.IN_PROGRESS) return;
    if (state.currentPlayer.id !== "AI") return;

    const decision = ai.decide(state);
    const newState = BattleResolver.resolveAttack(
      state,
      decision.attackerId,
      decision.defenderId
    );
    setLastAiAction(decision);
    setState(newState);
  }, [ai, state]);

  function playerAttack(attackerId: string, defenderId: string) {
    if (state.status !== GameStatus.IN_PROGRESS) return;
    if (state.currentPlayer.id !== "Player") return;

    const newState = BattleResolver.resolveAttack(
      state,
      attackerId,
      defenderId
    );

    setLastAiAction(null);
    setState(newState);
  }

  return {
    state,
    playerAttack,
    lastAiAction,
  };
}
