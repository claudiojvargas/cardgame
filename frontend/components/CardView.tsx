import type { CSSProperties } from "react";
import { Card } from "../../game/entities/Card";
import { CardClass, Rarity } from "../../game/types/enums";

const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: "#9e9e9e",
  [Rarity.UNCOMMON]: "#43a047",
  [Rarity.RARE]: "#1e88e5",
  [Rarity.EPIC]: "#8e24aa",
  [Rarity.LEGENDARY]: "#f9a825",
  [Rarity.MYTHIC]: "#d32f2f",
  [Rarity.DIAMOND]: "#26c6da",
};

const CLASS_COLORS: Record<CardClass, string> = {
  [CardClass.ATTACK]: "#ef5350",
  [CardClass.DEFENSE]: "#42a5f5",
  [CardClass.SUPPORT]: "#66bb6a",
  [CardClass.CONTROL]: "#7e57c2",
  [CardClass.CONTINUOUS]: "#26a69a",
  [CardClass.EVADE]: "#26c6da",
  [CardClass.CHAIN]: "#ff7043",
  [CardClass.STRATEGY]: "#ffca28",
};

function getCardGradient(card: Card) {
  const rarityColor = RARITY_COLORS[card.rarity];
  const classColor = CLASS_COLORS[card.cardClass];
  return `linear-gradient(135deg, ${rarityColor}, ${classColor})`;
}

interface Props {
  card: Card;
  onClick?: () => void;
  selectable?: boolean;
  style?: CSSProperties;
}

export function CardView({ card, onClick, selectable, style }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid rgba(0,0,0,0.45)",
        padding: 12,
        margin: 6,
        width: 140,
        height: 200,
        cursor: selectable ? "pointer" : "default",
        background: getCardGradient(card),
        color: "#111",
        boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
        ...style,
      }}
    >
      <strong>{card.name}</strong>
      <div>Power: {card.power}</div>
      <div>{card.cardClass}</div>
      <div>{card.rarity}</div>
    </div>
  );
}
