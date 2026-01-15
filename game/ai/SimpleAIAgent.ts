import { IAgent, AIDecision } from "./IAgent";
import { GameState } from "../core/GameState";
import { SynergySystem } from "../systems/SynergySystem";
import { AIDifficulty } from "./AIDifficulty";

interface MoveScore extends AIDecision {
  score: number;
}

export class SimpleAIAgent implements IAgent {
  constructor(private difficulty: AIDifficulty) {}

  decide(state: GameState): AIDecision {
    const ai = state.currentPlayer;
    const enemy = state.opponentPlayer;

    const aiSynergy = SynergySystem.calculate(ai);
    const enemySynergy = SynergySystem.calculate(enemy);

    const moves: MoveScore[] = [];

    for (const attacker of ai.field) {
      const attackerBonus =
        aiSynergy.get(attacker.cardClass)?.attackModifier ?? 0;
      const attackerPower = attacker.power + attackerBonus;

      for (const defender of enemy.field) {
        const defenderBonus =
          enemySynergy.get(defender.cardClass)?.attackModifier ?? 0;
        const defenderPower = defender.power + defenderBonus;

        let score = 0;

        if (attackerPower > defenderPower) {
          score += 100 + (attackerPower - defenderPower);
        } else if (attackerPower === defenderPower) {
          score += 40;
        } else {
          score -= defenderPower - attackerPower;
        }

        score += defender.power * 0.5;

        moves.push({
          attackerId: attacker.id,
          defenderId: defender.id,
          score,
        });
      }
    }

    return this.pickMoveByDifficulty(moves);
  }

  private pickMoveByDifficulty(moves: MoveScore[]): AIDecision {
    if (moves.length === 0) {
      throw new Error("No moves available");
    }

    // Ordena do melhor para o pior
    moves.sort((a, b) => b.score - a.score);

    switch (this.difficulty) {
      case AIDifficulty.EASY:
        return this.pickEasy(moves);

      case AIDifficulty.NORMAL:
        return this.pickNormal(moves);

      case AIDifficulty.HARD:
        return moves[0];
    }
  }

  private pickEasy(moves: MoveScore[]): AIDecision {
    // 50% chance de errar
    if (Math.random() < 0.5) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    return moves[0];
  }

  private pickNormal(moves: MoveScore[]): AIDecision {
    // Escolhe entre as 3 melhores
    const top = moves.slice(0, Math.min(3, moves.length));
    return top[Math.floor(Math.random() * top.length)];
  }
}