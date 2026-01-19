import type { CSSProperties } from "react";
import { Card } from "../../game/entities/Card";

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
        border: "1px solid #555",
        padding: 12,
        margin: 6,
        width: 140,
        height: 200,
        cursor: selectable ? "pointer" : "default",
        background: "#111",
        color: "#000",
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
