import { Deck } from "../game/entities/Deck";
import { Player } from "../game/entities/Player";
import { GameState } from "../game/core/GameState";
import { BattleResolver } from "../game/core/BattleResolver";
import { GameStatus } from "../game/types/enums";
import { createSeededRng } from "../game/utils/random";
import { CARD_DEFINITIONS } from "../game/data/cardDefinitions";
import { createCardFromDefinition } from "../game/data/cardFactory";

type SimulationResult = {
  winsA: number;
  winsB: number;
  draws: number;
};

function buildDeck(cardIds: string[]) {
  const cards = cardIds
    .map(id => CARD_DEFINITIONS.find(def => def.id === id))
    .filter((def): def is typeof CARD_DEFINITIONS[number] => Boolean(def))
    .map(createCardFromDefinition);
  return new Deck(cards);
}

function simulateMatch(seed: number, deckA: Deck, deckB: Deck): string {
  const rng = createSeededRng(seed);
  const playerA = new Player("A", deckA, rng);
  const playerB = new Player("B", deckB, rng);
  let state = new GameState(
    [playerA, playerB],
    rng.next() > 0.5 ? 0 : 1,
    1,
    GameStatus.IN_PROGRESS,
    undefined,
    rng
  );

  while (state.status === GameStatus.IN_PROGRESS) {
    const attacker = state.currentPlayer.field[0];
    const defender = state.opponentPlayer.field[0];
    state = BattleResolver.resolveAttack(state, attacker.id, defender.id);
  }

  return state.winnerId ?? "DRAW";
}

function runSimulations(iterations: number, deckA: Deck, deckB: Deck): SimulationResult {
  const result: SimulationResult = {
    winsA: 0,
    winsB: 0,
    draws: 0,
  };

  for (let i = 0; i < iterations; i += 1) {
    const winner = simulateMatch(1000 + i, deckA, deckB);
    if (winner === "A") {
      result.winsA += 1;
    } else if (winner === "B") {
      result.winsB += 1;
    } else {
      result.draws += 1;
    }
  }

  return result;
}

function run() {
  const iterations = Number(process.argv[2] ?? 50);
  const deckA = buildDeck([
    "common_attack_001",
    "uncommon_defense_001",
    "rare_support_001",
    "epic_control_001",
    "legendary_continuous_001",
    "mythic_strategy_001",
  ]);
  const deckB = buildDeck([
    "common_attack_001",
    "uncommon_defense_001",
    "rare_support_001",
    "epic_control_001",
    "legendary_continuous_001",
    "diamond_strategy_001",
  ]);

  const results = runSimulations(iterations, deckA, deckB);
  console.log("Simulation results:", results);
}

run();
