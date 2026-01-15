import { GameState } from "./GameState";
import { GameStatus } from "../types/enums";
import { SynergySystem } from "../systems/SynergySystem";

export class BattleResolver {
  static resolveAttack(
    state: GameState,
    attackerCardId: string,
    defenderCardId: string
  ): GameState {

    if (state.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Game already finished");
    }

    const attacker = state.currentPlayer.getCard(attackerCardId);
    const defender = state.opponentPlayer.getCard(defenderCardId);

    if (!attacker || !defender) {
      throw new Error("Invalid card selection");
    }

    // CLONE players (imutabilidade)
    const players = [...state.players] as [any, any];
    const current = players[state.currentPlayerIndex];
    const opponent = players[state.currentPlayerIndex === 0 ? 1 : 0];

    // Sinergia no combate
    const attackerBonuses = SynergySystem.calculate(state.currentPlayer);
    const defenderBonuses = SynergySystem.calculate(state.opponentPlayer);

    const attackerBonus =
      attackerBonuses.get(attacker.cardClass)?.attackModifier ?? 0;

    const defenderBonus =
      defenderBonuses.get(defender.cardClass)?.attackModifier ?? 0;

    const attackerPower = attacker.power + attackerBonus;
    const defenderPower = defender.power + defenderBonus;


    // RESOLVE POWER
    if (attackerPower > defenderPower) {
      attacker.power = attackerPower - defenderPower;
      opponent.removeCard(defender.id);
    } else if (attackerPower < defenderPower) {
      defender.power = defenderPower - attackerPower;
      current.removeCard(attacker.id);
    } else {
      current.removeCard(attacker.id);
      opponent.removeCard(defender.id);
    }

    // CHECK END GAME
    let status = GameStatus.IN_PROGRESS;
    let winnerId: string | undefined;

    if (current.hasLost() && opponent.hasLost()) {
      // quem atacou perde
      winnerId = opponent.id;
      status = GameStatus.FINISHED;
    } else if (opponent.hasLost()) {
      winnerId = current.id;
      status = GameStatus.FINISHED;
    } else if (current.hasLost()) {
      winnerId = opponent.id;
      status = GameStatus.FINISHED;
    }

    return new GameState(
      players,
      state.currentPlayerIndex === 0 ? 1 : 0,
      state.turn + 1,
      status,
      winnerId
    );
  }
}