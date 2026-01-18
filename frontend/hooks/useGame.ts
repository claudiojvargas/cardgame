import { useEffect, useMemo, useState } from "react";
import { GameState } from "../../game/core/GameState";
import { BattleResolver } from "../../game/core/BattleResolver";
import { GameStatus } from "../../game/types/enums";
import { SimpleAIAgent } from "../../game/ai/SimpleAIAgent";
import { AIDifficulty } from "../../game/ai/AIDifficulty";

export function useGame(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState);

  const ai = useMemo(() => new SimpleAIAgent(AIDifficulty.NORMAL), []);

  useEffect(() => {
    setState(initialState);
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

    setState(newState);
  }

  return {
    state,
    playerAttack,
  };
}
