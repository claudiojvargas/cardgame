import { Player } from "../entities/Player";
import { GameStatus } from "../types/enums";
import { RandomNumberGenerator, defaultRng } from "../utils/random";

export class GameState {
  readonly players: [Player, Player];
  readonly currentPlayerIndex: number;
  readonly turn: number;
  readonly status: GameStatus;
  readonly winnerId?: string;
  readonly rng: RandomNumberGenerator;

  constructor(
    players: [Player, Player],
    currentPlayerIndex: number,
    turn: number,
    status: GameStatus,
    winnerId?: string,
    rng: RandomNumberGenerator = defaultRng
  ) {
    this.players = players;
    this.currentPlayerIndex = currentPlayerIndex;
    this.turn = turn;
    this.status = status;
    this.winnerId = winnerId;
    this.rng = rng;
  }

  get currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  get opponentPlayer(): Player {
    return this.players[this.currentPlayerIndex === 0 ? 1 : 0];
  }
}
