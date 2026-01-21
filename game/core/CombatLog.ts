import { Shield } from "../entities/Card";
import { GameState } from "./GameState";

export type CombatEvent =
  | {
      type: "round_start";
      playerId: string;
      turn: number;
    }
  | {
      type: "attack_declared";
      attackerId: string;
      defenderId: string;
      turn: number;
    }
  | {
      type: "damage_applied";
      targetId: string;
      sourceId: string;
      amount: number;
      isDot: boolean;
      turn: number;
    }
  | {
      type: "card_destroyed";
      cardId: string;
      ownerId: string;
      turn: number;
    }
  | {
      type: "shield_applied";
      targetId: string;
      shieldType: Shield["type"];
      turn: number;
    }
  | {
      type: "dot_applied";
      targetId: string;
      sourceId: string;
      rounds: number;
      tickDamage: number;
      turn: number;
    }
  | {
      type: "proc_triggered";
      sourceId: string;
      chance: number;
      effect: string;
      turn: number;
    };

export interface BattleResult {
  state: GameState;
  events: CombatEvent[];
}
