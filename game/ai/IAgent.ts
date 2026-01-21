import { GameState } from "../core/GameState";

export interface AIDecision {
  attackerId: string;
  defenderId: string;
  reason?: string;
  score?: number;
}

export interface IAgent {
  decide(state: GameState): AIDecision;
}
