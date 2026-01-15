import { Card } from "./entities/Card";
import { Deck } from "./entities/Deck";
import { Player } from "./entities/Player";
import { GameState } from "./core/GameState";
import { BattleResolver } from "./core/BattleResolver";
import { CardClass, Rarity, GameStatus } from "./types/enums";

// CARTAS
const card = (
  id: string,
  power: number,
  cls: CardClass,
  rarity: Rarity
) =>
  new Card({
    id,
    name: id,
    basePower: power,
    cardClass: cls,
    rarity,
    developments: 0,
  });

const deck1 = new Deck([
  card("A1", 5, CardClass.ATTACK, Rarity.COMMON),
  card("A2", 4, CardClass.ATTACK, Rarity.COMMON),
  card("D1", 6, CardClass.DEFENSE, Rarity.UNCOMMON),
  card("S1", 7, CardClass.SUPPORT, Rarity.COMMON),
  card("C1", 4, CardClass.CONTROL, Rarity.COMMON),
  card("E1", 7, CardClass.ATTACK, Rarity.RARE),
]);

const deck2 = new Deck([
  card("B1", 6, CardClass.DEFENSE, Rarity.UNCOMMON),
  card("B2", 5, CardClass.ATTACK, Rarity.COMMON),
  card("B3", 4, CardClass.ATTACK, Rarity.COMMON),
  card("B4", 3, CardClass.SUPPORT, Rarity.COMMON),
  card("B5", 6, CardClass.CONTROL, Rarity.RARE),
  card("B6", 5, CardClass.ATTACK, Rarity.COMMON),
]);

const p1 = new Player("Player1", deck1);
const p2 = new Player("Player2", deck2);

// GAME START
let state = new GameState(
  [p1, p2],
  Math.random() > 0.5 ? 0 : 1,
  1,
  GameStatus.IN_PROGRESS
);

console.log("🔥 Game start");
console.log("First player:", state.currentPlayer.id);

// SIMULAÇÃO
while (state.status === GameStatus.IN_PROGRESS) {
  const attacker = state.currentPlayer.field[0];
  const defender = state.opponentPlayer.field[0];

  console.log(
    `\nTurn ${state.turn} | ${state.currentPlayer.id} attacks ${defender.id} with ${attacker.id}`
  );

  state = BattleResolver.resolveAttack(state, attacker.id, defender.id);

  console.log(
    "Field P1:",
    state.players[0].field.map(c => `${c.id}(${c.power})`)
  );
  console.log(
    "Field P2:",
    state.players[1].field.map(c => `${c.id}(${c.power})`)
  );
}

console.log("\n🏆 Winner:", state.winnerId);