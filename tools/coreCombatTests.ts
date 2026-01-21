import assert from "node:assert/strict";
import { Card } from "../game/entities/Card";
import { Deck } from "../game/entities/Deck";
import { Player } from "../game/entities/Player";
import { GameState } from "../game/core/GameState";
import { BattleResolver } from "../game/core/BattleResolver";
import { CardClass, GameStatus, Rarity } from "../game/types/enums";
import { createSeededRng } from "../game/utils/random";

function buildCard(id: string, power: number, cardClass: CardClass, rarity: Rarity) {
  return new Card({
    id,
    name: id,
    basePower: power,
    cardClass,
    rarity,
    awakening: 0,
  });
}

function buildPlayer(id: string, rngSeed: number) {
  const rng = createSeededRng(rngSeed);
  const deck = new Deck([
    buildCard(`${id}-1`, 5, CardClass.ATTACK, Rarity.COMMON),
    buildCard(`${id}-2`, 4, CardClass.DEFENSE, Rarity.UNCOMMON),
    buildCard(`${id}-3`, 3, CardClass.CONTROL, Rarity.COMMON),
    buildCard(`${id}-4`, 6, CardClass.ATTACK, Rarity.RARE),
    buildCard(`${id}-5`, 2, CardClass.SUPPORT, Rarity.COMMON),
    buildCard(`${id}-6`, 5, CardClass.STRATEGY, Rarity.UNCOMMON),
  ]);
  return { player: new Player(id, deck, rng), rng };
}

function testSeededRngDeterminism() {
  const rngA = createSeededRng(123);
  const rngB = createSeededRng(123);
  const sequenceA = Array.from({ length: 5 }, () => rngA.next());
  const sequenceB = Array.from({ length: 5 }, () => rngB.next());
  assert.deepEqual(sequenceA, sequenceB, "Seeded RNG should be deterministic.");
}

function testCombatLogCapturesAttack() {
  const { player: playerOne, rng } = buildPlayer("PlayerA", 42);
  const { player: playerTwo } = buildPlayer("PlayerB", 99);
  const state = new GameState(
    [playerOne, playerTwo],
    0,
    1,
    GameStatus.IN_PROGRESS,
    undefined,
    rng
  );

  const attacker = state.currentPlayer.field[0];
  const defender = state.opponentPlayer.field[0];

  const result = BattleResolver.resolveAttackWithLog(state, attacker.id, defender.id);

  assert.equal(result.state.turn, 2, "Turn should increment after attack.");
  assert.ok(result.events.some(event => event.type === "attack_declared"));
  assert.ok(result.events.some(event => event.type === "damage_applied"));
}

function run() {
  testSeededRngDeterminism();
  testCombatLogCapturesAttack();
  console.log("✅ Core combat tests passed.");
}

run();
