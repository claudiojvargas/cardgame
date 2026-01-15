import { GameState } from "../core/GameState";

export interface AIDecision {
  attackerId: string;
  defenderId: string;
}

export interface IAgent {
  decide(state: GameState): AIDecision;
}