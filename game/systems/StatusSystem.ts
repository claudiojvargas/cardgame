import { Card, DotEffect, Shield, StatusEffect } from "../entities/Card";

export function createShield(type: Shield["type"]): Shield {
  return {
    type,
    usesLeft: 1,
    consumedOnAttack: true,
    consumedOnDamaged: true,
  };
}

export function getShield(card: Card): Shield | null {
  const status = card.statusEffects.find(
    effect => effect.type === "SHIELD"
  ) as StatusEffect | undefined;
  return status?.type === "SHIELD" ? status.shield : null;
}

export function setShield(card: Card, shield: Shield | null) {
  card.statusEffects = card.statusEffects.filter(
    effect => effect.type !== "SHIELD"
  );
  if (shield) {
    card.statusEffects.push({ type: "SHIELD", shield });
  }
}

export function consumeShieldOnAttack(card: Card) {
  const shield = getShield(card);
  if (shield?.consumedOnAttack) {
    setShield(card, null);
  }
}

export function consumeShieldOnDamaged(card: Card): Shield | null {
  const shield = getShield(card);
  if (!shield) return null;
  if (shield.consumedOnDamaged) {
    setShield(card, null);
    return shield;
  }
  return null;
}

export function applyFrozen(card: Card, rounds: number) {
  const existing = card.statusEffects.find(
    effect => effect.type === "FROZEN"
  ) as StatusEffect | undefined;

  if (existing && existing.type === "FROZEN") {
    existing.roundsLeft = Math.max(existing.roundsLeft, rounds);
    return;
  }

  card.statusEffects.push({ type: "FROZEN", roundsLeft: rounds });
}

export function getFrozenRounds(card: Card): number {
  const status = card.statusEffects.find(
    effect => effect.type === "FROZEN"
  ) as StatusEffect | undefined;
  return status?.type === "FROZEN" ? status.roundsLeft : 0;
}

export function decrementFrozen(card: Card) {
  const updated: StatusEffect[] = [];
  card.statusEffects.forEach(effect => {
    if (effect.type !== "FROZEN") {
      updated.push(effect);
      return;
    }
    const next = effect.roundsLeft - 1;
    if (next > 0) {
      updated.push({ ...effect, roundsLeft: next });
    }
  });
  card.statusEffects = updated;
}

export function addDot(card: Card, dot: DotEffect) {
  card.statusEffects.push({
    type: "DOT",
    roundsLeft: dot.roundsLeft,
    tickDamage: dot.tickDamage,
    sourceId: dot.sourceId,
  });
}

export function getDots(card: Card): DotEffect[] {
  return card.statusEffects
    .filter(effect => effect.type === "DOT")
    .map(effect => {
      const dot = effect as StatusEffect;
      if (dot.type !== "DOT") return null;
      return {
        roundsLeft: dot.roundsLeft,
        tickDamage: dot.tickDamage,
        sourceId: dot.sourceId,
        type: "DOT",
      };
    })
    .filter((dot): dot is DotEffect => dot !== null);
}

export function tickDots(card: Card): DotEffect[] {
  const dots = getDots(card);
  const updated: StatusEffect[] = [];
  card.statusEffects.forEach(effect => {
    if (effect.type !== "DOT") {
      updated.push(effect);
      return;
    }
    const next = effect.roundsLeft - 1;
    if (next > 0) {
      updated.push({ ...effect, roundsLeft: next });
    }
  });
  card.statusEffects = updated;
  return dots;
}
