import { AIDifficulty } from "../ai/AIDifficulty";

export function difficultyByFloor(floor: number): AIDifficulty {
  if (floor <= 10) return AIDifficulty.EASY;
  if (floor <= 20) return AIDifficulty.NORMAL;
  return AIDifficulty.HARD;
}