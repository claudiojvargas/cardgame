import { Card } from "../game/entities/Card";
import { Deck } from "../game/entities/Deck";
import { Player } from "../game/entities/Player";
import { GameState } from "../game/core/GameState";
import { GameStatus, CardClass, Rarity } from "../game/types/enums";

// Helper para criar carta
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
    awakening: 0,
  });

// 🔹 Deck base do jogador (fixo na run)
export function createPlayer() {
  const deck = new Deck([
    card("P1", 5, CardClass.ATTACK, Rarity.COMMON),
    card("P2", 6, CardClass.DEFENSE, Rarity.UNCOMMON),
    card("P3", 4, CardClass.CONTROL, Rarity.COMMON),
    card("P4", 3, CardClass.SUPPORT, Rarity.COMMON),
    card("P5", 5, CardClass.ATTACK, Rarity.RARE),
    card("P6", 4, CardClass.STRATEGY, Rarity.COMMON),
  ]);

  return new Player("Player", deck);
}
