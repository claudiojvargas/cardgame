import { TowerReward } from "./TowerRun";

export function rewardByFloor(floor: number): TowerReward {
  const gold = 50 + floor * 20;

  if (floor === 10 || floor === 20 || floor === 30) {
    return {
      gold,
      blueDiamonds: 5,
      chestId: `tower-${floor}`,
    };
  }

  if (floor % 5 === 0) {
    return {
      gold,
      chestId: `tower-${floor}`,
    };
  }

  return { gold };
}