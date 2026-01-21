import { IAgent, AIDecision } from "./IAgent";
import { GameState } from "../core/GameState";
import { AIDifficulty } from "./AIDifficulty";
import { RandomNumberGenerator, defaultRng } from "../utils/random";

interface MoveScore extends AIDecision {
  score: number;
}

export class SimpleAIAgent implements IAgent {
  constructor(
    private difficulty: AIDifficulty,
    private rng: RandomNumberGenerator = defaultRng
  ) {}

  decide(state: GameState): AIDecision {
    const ai = state.currentPlayer;
    const enemy = state.opponentPlayer;
    const rng = state.rng ?? this.rng;

    const moves: MoveScore[] = [];

    for (const attacker of ai.field) {
      const attackerPower = attacker.power * (1 + attacker.buffPowerPctTotal);

      for (const defender of enemy.field) {
        const defenderPower = defender.power * (1 + defender.buffPowerPctTotal);

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

    return this.pickMoveByDifficulty(moves, rng);
  }

  private pickMoveByDifficulty(
    moves: MoveScore[],
    rng: RandomNumberGenerator
  ): AIDecision {
    if (moves.length === 0) {
      throw new Error("No moves available");
    }

    // Ordena do melhor para o pior
    moves.sort((a, b) => b.score - a.score);

    switch (this.difficulty) {
      case AIDifficulty.EASY:
        return this.pickEasy(moves, rng);

      case AIDifficulty.NORMAL:
        return this.pickNormal(moves, rng);

      case AIDifficulty.HARD:
        return {
          ...moves[0],
          reason: `Melhor jogada (score ${moves[0].score.toFixed(1)})`,
        };
    }
  }

  private pickEasy(
    moves: MoveScore[],
    rng: RandomNumberGenerator
  ): AIDecision {
    // 50% chance de errar
    if (rng.next() < 0.5) {
      const pick = moves[Math.floor(rng.next() * moves.length)];
      return {
        ...pick,
        reason: `Escolha aleatória (modo fácil, score ${pick.score.toFixed(1)})`,
      };
    }
    return {
      ...moves[0],
      reason: `Escolha forte (modo fácil, score ${moves[0].score.toFixed(1)})`,
    };
  }

  private pickNormal(
    moves: MoveScore[],
    rng: RandomNumberGenerator
  ): AIDecision {
    // Escolhe entre as 3 melhores
    const top = moves.slice(0, Math.min(3, moves.length));
    const pick = top[Math.floor(rng.next() * top.length)];
    return {
      ...pick,
      reason: `Escolha entre top ${top.length} (score ${pick.score.toFixed(1)})`,
    };
  }
}
