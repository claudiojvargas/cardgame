import { useState } from "react";
import { GameState } from "../../game/core/GameState";
import { BattleResolver } from "../../game/core/BattleResolver";
import { GameStatus } from "../../game/types/enums";
import { SimpleAIAgent } from "../../game/ai/SimpleAIAgent";
import { AIDifficulty } from "../../game/ai/AIDifficulty";

export function useGame(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState);

  const ai = new SimpleAIAgent(AIDifficulty.NORMAL);

  function playerAttack(attackerId: string, defenderId: string) {
    if (state.status !== GameStatus.IN_PROGRESS) return;
    if (state.currentPlayer.id !== "Player") return;

    let newState = BattleResolver.resolveAttack(
      state,
      attackerId,
      defenderId
    );

    // Turno da IA automaticamente
    if (
      newState.status === GameStatus.IN_PROGRESS &&
      newState.currentPlayer.id === "AI"
    ) {
      const decision = ai.decide(newState);
      newState = BattleResolver.resolveAttack(
        newState,
        decision.attackerId,
        decision.defenderId
      );
    }

    setState(newState);
  }

  return {
    state,
    playerAttack,
  };
}