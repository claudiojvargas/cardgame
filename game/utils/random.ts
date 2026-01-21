export interface RandomNumberGenerator {
  next(): number;
}

export const defaultRng: RandomNumberGenerator = {
  next: () => Math.random(),
};

export function createSeededRng(seed: number): RandomNumberGenerator {
  let state = seed >>> 0;
  return {
    next: () => {
      state = (1664525 * state + 1013904223) % 0x100000000;
      return state / 0x100000000;
    },
  };
}
