import { Card } from "../../game/entities/Card";

interface Props {
  card: Card;
  onClick?: () => void;
  selectable?: boolean;
}

export function CardView({ card, onClick, selectable }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #555",
        padding: 8,
        margin: 4,
        width: 90,
        cursor: selectable ? "pointer" : "default",
        background: selectable ? "#222" : "#111",
      }}
    >
      <strong>{card.name}</strong>
      <div>Power: {card.power}</div>
      <div>{card.cardClass}</div>
      <div>{card.rarity}</div>
    </div>
  );
}