import { GameState } from "./GameState";
import { GameStatus } from "../types/enums";
import { Card, DotEffect, Shield } from "../entities/Card";
import { Player } from "../entities/Player";
import { CardClass, Rarity } from "../types/enums";
import { BattleResult, CombatEvent } from "./CombatLog";
import { RandomNumberGenerator } from "../utils/random";
import {
  addDot,
  applyFrozen,
  consumeShieldOnAttack,
  consumeShieldOnDamaged,
  createShield,
  decrementFrozen,
  getDots,
  getFrozenRounds,
  tickDots,
  setShield,
} from "../systems/StatusSystem";

export class BattleResolver {
  static resolveAttack(
    state: GameState,
    attackerCardId: string,
    defenderCardId: string
  ): GameState {
    return this.resolveAttackWithLog(state, attackerCardId, defenderCardId)
      .state;
  }

  static resolveAttackWithLog(
    state: GameState,
    attackerCardId: string,
    defenderCardId: string
  ): BattleResult {
    if (state.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Game already finished");
    }

    const attacker = state.currentPlayer.getCard(attackerCardId);
    const defender = state.opponentPlayer.getCard(defenderCardId);

    if (!attacker || !defender) {
      throw new Error("Invalid card selection");
    }

    const events: CombatEvent[] = [];
    const players = [...state.players] as [Player, Player];
    const current = players[state.currentPlayerIndex];
    const opponent = players[state.currentPlayerIndex === 0 ? 1 : 0];
    const rng = state.rng;

    events.push({
      type: "round_start",
      playerId: current.id,
      turn: state.turn,
    });

    applyStartRoundEffects(current, opponent, rng, events, state.turn);
    applyStartRoundEffects(opponent, current, rng, events, state.turn);

    if (!canAttack(attacker)) {
      return {
        state: new GameState(
          players,
          state.currentPlayerIndex === 0 ? 1 : 0,
          state.turn + 1,
          state.status,
          state.winnerId,
          rng
        ),
        events,
      };
    }

    events.push({
      type: "attack_declared",
      attackerId: attacker.id,
      defenderId: defender.id,
      turn: state.turn,
    });

    resolveAttackFlow(attacker, defender, current, opponent, rng, events, state.turn);

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

    return {
      state: new GameState(
        players,
        state.currentPlayerIndex === 0 ? 1 : 0,
        state.turn + 1,
        status,
        winnerId,
        rng
      ),
      events,
    };
  }
}

function resolveAttackFlow(
  attacker: Card,
  defender: Card,
  current: Player,
  opponent: Player,
  rng: RandomNumberGenerator,
  events: CombatEvent[],
  turn: number
) {
  if (!canAttack(attacker)) return;

  consumeShieldOnAttack(attacker);

  const damage = getEffectivePower(attacker);
  applyDamage(defender, damage, attacker, opponent, current, false, rng, events, turn);

  applyPostAttackEffects(attacker, defender, current, opponent, damage, rng, events, turn);
}

function canAttack(card: Card) {
  return getFrozenRounds(card) === 0;
}

function applyStartRoundEffects(
  current: Player,
  opponent: Player,
  rng: RandomNumberGenerator,
  events: CombatEvent[],
  turn: number
) {
  current.field.forEach((card: Card) => {
    if (getFrozenRounds(card) > 0) {
      decrementFrozen(card);
    }

    const dots = getDots(card);
    if (dots.length > 0) {
      dots.forEach(dot => {
        applyDamage(card, dot.tickDamage, card, current, opponent, true, rng, events, turn);
      });
      tickDots(card);
    }

    if (card.cardClass === CardClass.STRATEGY) {
      const targets = pickRandomTargets(opponent.field, 2, rng);
      targets.forEach(target => {
        applyDamage(target, card.basePower * 0.25, card, opponent, current, false, rng, events, turn);
      });

      rollProc(card, 0.1, "STRATEGY_SHIELD_TEAM", rng, events, turn, () => {
        current.field.forEach((ally: Card) => {
          applyShield(ally, "TOTAL_REFLECT_100", events, turn);
        });
      });
    }
  });
}

function applyDamage(
  defender: Card,
  damage: number,
  attacker: Card,
  defenderOwner: Player,
  attackerOwner: Player,
  isDot: boolean,
  rng: RandomNumberGenerator,
  events: CombatEvent[],
  turn: number
) {
  defender.hp -= damage;
  events.push({
    type: "damage_applied",
    targetId: defender.id,
    sourceId: attacker.id,
    amount: damage,
    isDot,
    turn,
  });

  const shield = consumeShieldOnDamaged(defender);
  if (shield) {
    const reflect = shield.type === "TOTAL_REFLECT_100" ? 1 : 0.5;
    applyReflectedDamage(attacker, damage * reflect, attackerOwner, defender.id, events, turn);
  }

  if (defender.hp <= 0) {
    defenderOwner.removeCard(defender.id);
    events.push({
      type: "card_destroyed",
      cardId: defender.id,
      ownerId: defenderOwner.id,
      turn,
    });
  }

  if (!isDot) {
    applyOnHitEffects(attacker, defender, attackerOwner, defenderOwner, rng, events, turn);
  }
}

function applyReflectedDamage(
  attacker: Card,
  damage: number,
  attackerOwner: Player,
  sourceId: string,
  events: CombatEvent[],
  turn: number
) {
  if (attacker.cardClass === CardClass.EVADE) {
    return;
  }
  attacker.hp -= damage;
  events.push({
    type: "damage_applied",
    targetId: attacker.id,
    sourceId,
    amount: damage,
    isDot: false,
    turn,
  });
  if (attacker.hp <= 0) {
    attackerOwner.removeCard(attacker.id);
    events.push({
      type: "card_destroyed",
      cardId: attacker.id,
      ownerId: attackerOwner.id,
      turn,
    });
  }
}

function applyOnHitEffects(
  attacker: Card,
  defender: Card,
  current: Player,
  opponent: Player,
  rng: RandomNumberGenerator,
  events: CombatEvent[],
  turn: number
) {
  if (attacker.cardClass === CardClass.CONTROL) {
    applyFrozen(defender, 4);
    rollProc(attacker, 0.05, "CONTROL_FREEZE_CHAIN", rng, events, turn, () => {
      const extra = pickRandomTargets(
        opponent.field.filter((card: Card) => card.id !== defender.id),
        1,
        rng
      );
      extra.forEach(target => {
        applyFrozen(target, 4);
      });
    });
  }

  if (attacker.cardClass === CardClass.EVADE) {
    rollProc(attacker, 0.05, "EVADE_SHIELD", rng, events, turn, () => {
      applyShield(attacker, "TOTAL_REFLECT_100", events, turn);
    });
  }
}

function applyPostAttackEffects(
  attacker: Card,
  defender: Card,
  current: Player,
  opponent: Player,
  damage: number,
  rng: RandomNumberGenerator,
  events: CombatEvent[],
  turn: number
) {
  if (attacker.cardClass === CardClass.CONTINUOUS) {
    const dot: DotEffect = {
      roundsLeft: 4,
      tickDamage: getEffectivePower(defender) * 0.05,
      sourceId: attacker.id,
      type: "DOT",
    };
    addDot(defender, dot);
    events.push({
      type: "dot_applied",
      targetId: defender.id,
      sourceId: attacker.id,
      rounds: dot.roundsLeft,
      tickDamage: dot.tickDamage,
      turn,
    });

    rollProc(attacker, 0.05, "CONTINUOUS_EXTRA_ATTACK", rng, events, turn, () => {
      const extraTargets = pickRandomTargets(
        opponent.field.filter((card: Card) => card.id !== defender.id),
        1,
        rng
      );
      extraTargets.forEach(target => {
        resolveAttackFlow(attacker, target, current, opponent, rng, events, turn);
      });
    });
  }

  if (attacker.cardClass === CardClass.CHAIN) {
    const extraTargets = pickRandomTargets(
      opponent.field.filter((card: Card) => card.id !== defender.id),
      1,
      rng
    );
    extraTargets.forEach(target => {
      applyDamage(target, damage, attacker, opponent, current, false, rng, events, turn);
    });

    rollProc(attacker, 0.05, "CHAIN_ATTACK_ALL", rng, events, turn, () => {
      opponent.field.forEach((target: Card) => {
        applyDamage(target, damage, attacker, opponent, current, false, rng, events, turn);
      });
    });
  }

  if (attacker.cardClass === CardClass.ATTACK) {
    rollProc(attacker, 0.05, "ATTACK_TEAM_BUFF", rng, events, turn, () => {
      current.field.forEach((ally: Card) => {
        ally.buffPowerPctTotal += 0.25;
      });
    });
  }

  if (attacker.cardClass === CardClass.DEFENSE) {
    rollProc(attacker, 0.05, "DEFENSE_SHIELD_TEAM", rng, events, turn, () => {
      current.field.forEach((ally: Card) => {
        applyShield(ally, "TOTAL_REFLECT_100", events, turn);
      });
    });
  }
}

function getEffectivePower(card: Card) {
  return card.power * (1 + card.buffPowerPctTotal);
}

function rollProc(
  card: Card,
  chance: number,
  effect: string,
  rng: RandomNumberGenerator,
  events: CombatEvent[],
  turn: number,
  onProc: () => void
) {
  if (!isProcEligible(card.rarity)) return;
  if (rng.next() < chance) {
    events.push({
      type: "proc_triggered",
      sourceId: card.id,
      chance,
      effect,
      turn,
    });
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

function applyShield(
  target: Card,
  type: Shield["type"],
  events: CombatEvent[],
  turn: number
) {
  setShield(target, createShield(type));
  events.push({
    type: "shield_applied",
    targetId: target.id,
    shieldType: type,
    turn,
  });
}

function pickRandomTargets<T>(
  targets: T[],
  count: number,
  rng: RandomNumberGenerator
): T[] {
  if (targets.length <= count) {
    return targets;
  }
  const pool = [...targets];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.next() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
