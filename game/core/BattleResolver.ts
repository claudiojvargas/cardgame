import { GameState } from "./GameState";
import { GameStatus } from "../types/enums";
import { Card, DotEffect, Shield } from "../entities/Card";
import { CardClass, Rarity } from "../types/enums";

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

    const players = [...state.players] as [any, any];
    const current = players[state.currentPlayerIndex];
    const opponent = players[state.currentPlayerIndex === 0 ? 1 : 0];

    applyStartRoundEffects(current, opponent);
    applyStartRoundEffects(opponent, current);

    if (!canAttack(attacker)) {
      return new GameState(
        players,
        state.currentPlayerIndex === 0 ? 1 : 0,
        state.turn + 1,
        state.status,
        state.winnerId
      );
    }

    resolveAttackFlow(attacker, defender, current, opponent);

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

function resolveAttackFlow(
  attacker: Card,
  defender: Card,
  current: any,
  opponent: any
) {
  if (!canAttack(attacker)) return;

  if (attacker.shield?.consumedOnAttack) {
    attacker.shield = null;
  }

  const damage = getEffectivePower(attacker);
  applyDamage(defender, damage, attacker, opponent, current);

  applyPostAttackEffects(attacker, defender, current, opponent, damage);
}

function canAttack(card: Card) {
  return card.statusFrozenRounds === 0;
}

function applyStartRoundEffects(current: any, opponent: any) {
  current.field.forEach((card: Card) => {
    if (card.statusFrozenRounds > 0) {
      card.statusFrozenRounds -= 1;
    }

    if (card.dotList.length > 0) {
      card.dotList.forEach(dot => {
        applyDamage(card, dot.tickDamage, card, current, opponent, true);
      });
      card.dotList = card.dotList
        .map(dot => ({ ...dot, roundsLeft: dot.roundsLeft - 1 }))
        .filter(dot => dot.roundsLeft > 0);
    }

    if (card.cardClass === CardClass.STRATEGY) {
      const targets = pickRandomTargets(opponent.field, 2);
      targets.forEach(target => {
        applyDamage(target, card.basePower * 0.25, card, opponent, current);
      });

      rollProc(card, 0.1, () => {
        current.field.forEach((ally: Card) => {
          ally.shield = buildShield("TOTAL_REFLECT_100");
        });
      });
    }
  });
}

function applyDamage(
  defender: Card,
  damage: number,
  attacker: Card,
  defenderOwner: any,
  attackerOwner: any,
  isDot = false
) {
  defender.hp -= damage;

  if (defender.shield?.consumedOnDamaged) {
    const reflect = defender.shield.type === "TOTAL_REFLECT_100" ? 1 : 0.5;
    applyReflectedDamage(attacker, damage * reflect, attackerOwner);
    defender.shield = null;
  }

  if (defender.hp <= 0) {
    defenderOwner.removeCard(defender.id);
  }

  if (!isDot) {
    applyOnHitEffects(attacker, defender, attackerOwner, defenderOwner);
  }
}

function applyReflectedDamage(attacker: Card, damage: number, attackerOwner: any) {
  if (attacker.cardClass === CardClass.EVADE) {
    return;
  }
  attacker.hp -= damage;
  if (attacker.hp <= 0) {
    attackerOwner.removeCard(attacker.id);
  }
}

function applyOnHitEffects(attacker: Card, defender: Card, current: any, opponent: any) {
  if (attacker.cardClass === CardClass.CONTROL) {
    defender.statusFrozenRounds = Math.max(defender.statusFrozenRounds, 4);
    rollProc(attacker, 0.05, () => {
      const extra = pickRandomTargets(
        opponent.field.filter((card: Card) => card.id !== defender.id),
        1
      );
      extra.forEach(target => {
        target.statusFrozenRounds = Math.max(target.statusFrozenRounds, 4);
      });
    });
  }

  if (attacker.cardClass === CardClass.EVADE) {
    rollProc(attacker, 0.05, () => {
      attacker.shield = buildShield("TOTAL_REFLECT_100");
    });
  }
}

function applyPostAttackEffects(
  attacker: Card,
  defender: Card,
  current: any,
  opponent: any,
  damage: number
) {
  if (attacker.cardClass === CardClass.CONTINUOUS) {
    const dot: DotEffect = {
      roundsLeft: 4,
      tickDamage: getEffectivePower(defender) * 0.05,
      sourceId: attacker.id,
      type: "DOT",
    };
    defender.dotList.push(dot);

    rollProc(attacker, 0.05, () => {
      const extraTargets = pickRandomTargets(
        opponent.field.filter((card: Card) => card.id !== defender.id),
        1
      );
      extraTargets.forEach(target => {
        resolveAttackFlow(attacker, target, current, opponent);
      });
    });
  }

  if (attacker.cardClass === CardClass.CHAIN) {
    const extraTargets = pickRandomTargets(
      opponent.field.filter((card: Card) => card.id !== defender.id),
      1
    );
    extraTargets.forEach(target => {
      applyDamage(target, damage, attacker, opponent, current);
    });

    rollProc(attacker, 0.05, () => {
      opponent.field.forEach((target: Card) => {
        applyDamage(target, damage, attacker, opponent, current);
      });
    });
  }

  if (attacker.cardClass === CardClass.ATTACK) {
    rollProc(attacker, 0.05, () => {
      current.field.forEach((ally: Card) => {
        ally.buffPowerPctTotal += 0.25;
      });
    });
  }

  if (attacker.cardClass === CardClass.DEFENSE) {
    rollProc(attacker, 0.05, () => {
      current.field.forEach((ally: Card) => {
        ally.shield = buildShield("TOTAL_REFLECT_100");
      });
    });
  }
}

function getEffectivePower(card: Card) {
  return card.power * (1 + card.buffPowerPctTotal);
}

function rollProc(card: Card, chance: number, onProc: () => void) {
  if (!isProcEligible(card.rarity)) return;
  if (Math.random() < chance) {
    onProc();
  }
}

function isProcEligible(rarity: Rarity) {
  return (
    rarity === Rarity.EPIC ||
    rarity === Rarity.LEGENDARY ||
    rarity === Rarity.MYTHIC ||
    rarity === Rarity.DIAMOND
  );
}

function buildShield(type: Shield["type"]): Shield {
  return {
    type,
    usesLeft: 1,
    consumedOnAttack: true,
    consumedOnDamaged: true,
  };
}

function pickRandomTargets<T>(targets: T[], count: number): T[] {
  if (targets.length <= count) {
    return targets;
  }
  const pool = [...targets].sort(() => Math.random() - 0.5);
  return pool.slice(0, count);
}
