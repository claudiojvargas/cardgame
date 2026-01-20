import { Card } from "../entities/Card";
import { getRarityConfig } from "../config/rarity.config";

export function calculateCardPower(card: Card): number {
  let power = card.basePower;

  for (let i = 0; i < card.awakening; i += 1) {
    power = Math.round(power * 1.1);
  }

  return power;
}

export function getAwakeningCost(card: Card): number {
  return Math.max(1, card.awakening);
}

export function canAwaken(card: Card, duplicatesAvailable: number): boolean {
  const { maxAwakening } = getRarityConfig(card.rarity);
  if (card.awakening >= maxAwakening) {
    return false;
  }

  return duplicatesAvailable >= getAwakeningCost(card);
}

export function applyAwakening(card: Card): Card {
  const { maxAwakening } = getRarityConfig(card.rarity);
  if (card.awakening >= maxAwakening) {
    return card;
  }

  card.awakening += 1;
  card.power = calculateCardPower(card);
  return card;
}
