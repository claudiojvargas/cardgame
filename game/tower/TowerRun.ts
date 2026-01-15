import { Player } from "../entities/Player";

export interface TowerReward {
  gold: number;
  blueDiamonds?: number;
  chestId?: string;
}

export class TowerRun {
  currentFloor = 1;
  maxFloor = 30;
  rewards: TowerReward[] = [];

  constructor(public player: Player) {}

  isCompleted(): boolean {
    return this.currentFloor > this.maxFloor;
  }

  advance(reward: TowerReward) {
    this.rewards.push(reward);
    this.currentFloor++;
  }
}