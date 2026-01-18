import { Card } from "../../game/entities/Card";

interface Props {
  card: Card;
  obtained: boolean;
  onClick?: () => void;
}

export function CardTile({ card, obtained, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={obtained ? onClick : undefined}
      style={{
        height: 200,
        width: 140,
        padding: 12,
        margin: 6,
        borderRadius: 8,
        border: "1px solid #666",
        textAlign: "left",
        background: obtained ? "#cfeecf" : "#d9d9d9",
        color: obtained ? "#999" : "#111",
        cursor: obtained ? "pointer" : "not-allowed",
        opacity: obtained ? 1 : 0.7,
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>
        {card.name}
      </strong>
      <div>Poder: {card.power}</div>
      <div>Raridade: {card.rarity}</div>
      <div>Classe: {card.cardClass}</div>
      <div>Despertar: {card.awakening}</div>
    </button>
  );
}
