import { Player } from "./entities/Player";
import { Deck } from "./entities/Deck";
import { Card } from "./entities/Card";
import { GameState } from "./core/GameState";
import { BattleResolver } from "./core/BattleResolver";
import { GameStatus, CardClass, Rarity } from "./types/enums";
import { SimpleAIAgent } from "./ai/SimpleAIAgent";
import { difficultyByFloor } from "./tower/TowerDifficulty";
import { TowerEnemyFactory } from "./tower/TowerEnemyFactory";
import { rewardByFloor } from "./tower/TowerRewards";
import { TowerRun } from "./tower/TowerRun";

// Player
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

const player = new Player(
  "Player",
  new Deck([
    card("P1", 35, CardClass.ATTACK, Rarity.MYTHIC),
    card("P2", 18, CardClass.STRATEGY, Rarity.LEGENDARY),
    card("P3", 14, CardClass.CONTROL, Rarity.EPIC),
    card("P4", 22, CardClass.SUPPORT, Rarity.MYTHIC),
    card("P5", 18, CardClass.ATTACK, Rarity.LEGENDARY),
    card("P6", 50, CardClass.SUPPORT, Rarity.DIAMOND),
  ])
);

const run = new TowerRun(player);

console.log("🏰 Tower Run Start");

while (!run.isCompleted()) {
  const floor = run.currentFloor;

  console.log(`\n🏯 Floor ${floor}`);

  const enemyDeck = TowerEnemyFactory.createEnemy(floor);
  const enemy = new Player("Tower", enemyDeck);

  const ai = new SimpleAIAgent(difficultyByFloor(floor));

  let state = new GameState(
    [player, enemy],
    Math.random() > 0.5 ? 0 : 1,
    1,
    GameStatus.IN_PROGRESS
  );

  while (state.status === GameStatus.IN_PROGRESS) {
    if (state.currentPlayer.id === "Tower") {
      const move = ai.decide(state);
      state = BattleResolver.resolveAttack(
        state,
        move.attackerId,
        move.defenderId
      );
    } else {
      // Player automático (MVP)
      const attacker = state.currentPlayer.field[0];
      const defender = state.opponentPlayer.field[0];

      state = BattleResolver.resolveAttack(
        state,
        attacker.id,
        defender.id
      );
    }
  }

  if (state.winnerId === "Player") {
    const reward = rewardByFloor(floor);
    run.advance(reward);
    console.log("✅ Cleared floor", floor, "Reward:", reward);
  } else {
    console.log("❌ Defeated at floor", floor);
    break;
  }
}

console.log("\n🎁 Tower Rewards:", run.rewards);