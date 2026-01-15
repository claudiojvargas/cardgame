import { Card } from "./entities/Card";
import { Deck } from "./entities/Deck";
import { Player } from "./entities/Player";
import { GameState } from "./core/GameState";
import { BattleResolver } from "./core/BattleResolver";
import { CardClass, Rarity, GameStatus } from "./types/enums";
import { SimpleAIAgent } from "./ai/SimpleAIAgent";
import { AIDifficulty } from "./ai/AIDifficulty";

// Helper
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

// Player deck
const playerDeck = new Deck([
  card("P1", 5, CardClass.ATTACK, Rarity.COMMON),
  card("P2", 6, CardClass.DEFENSE, Rarity.UNCOMMON),
  card("P3", 6, CardClass.CONTROL, Rarity.COMMON),
  card("P4", 3, CardClass.SUPPORT, Rarity.COMMON),
  card("P5", 6, CardClass.ATTACK, Rarity.RARE),
  card("P6", 4, CardClass.STRATEGY, Rarity.COMMON),
]);

// AI deck
const aiDeck = new Deck([
  card("AI1", 6, CardClass.DEFENSE, Rarity.UNCOMMON),
  card("AI2", 5, CardClass.ATTACK, Rarity.COMMON),
  card("AI3", 4, CardClass.ATTACK, Rarity.COMMON),
  card("AI4", 3, CardClass.SUPPORT, Rarity.COMMON),
  card("AI5", 5, CardClass.CONTROL, Rarity.RARE),
  card("AI6", 4, CardClass.ATTACK, Rarity.COMMON),
]);

const player = new Player("Player", playerDeck);
const aiPlayer = new Player("AI", aiDeck);

const aiAgent = new SimpleAIAgent(AIDifficulty.NORMAL);

let state = new GameState(
  [player, aiPlayer],
  Math.random() > 0.5 ? 0 : 1,
  1,
  GameStatus.IN_PROGRESS
);

console.log("🎮 Player vs AI");
console.log("First:", state.currentPlayer.id);

while (state.status === GameStatus.IN_PROGRESS) {
  console.log(`\nTurn ${state.turn} | ${state.currentPlayer.id}`);

  if (state.currentPlayer.id === "AI") {
    const decision = aiAgent.decide(state);
    console.log(
      `AI attacks ${decision.defenderId} with ${decision.attackerId}`
    );

    state = BattleResolver.resolveAttack(
      state,
      decision.attackerId,
      decision.defenderId
    );
  } else {
    // Player simples automático (pra teste)
    const attacker = state.currentPlayer.field[0];
    const defender = state.opponentPlayer.field[0];

    console.log(
      `Player attacks ${defender.id} with ${attacker.id}`
    );

    state = BattleResolver.resolveAttack(
      state,
      attacker.id,
      defender.id
    );
  }

  console.log(
    "Player field:",
    state.players[0].field.map(c => `${c.id}(${c.power})`)
  );
  console.log(
    "AI field:",
    state.players[1].field.map(c => `${c.id}(${c.power})`)
  );
}

console.log("\n🏆 Winner:", state.winnerId);