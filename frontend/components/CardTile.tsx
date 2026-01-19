import { Card } from "../../game/entities/Card";

interface Props {
  card: Card;
  obtained: boolean;
  isNew?: boolean;
  duplicateCount?: number;
  onClick?: () => void;
}

export function CardTile({
  card,
  obtained,
  isNew = false,
  duplicateCount = 0,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={obtained ? onClick : undefined}
      style={{
        position: "relative",
        height: 200,
        width: 140,
        padding: 12,
        margin: 6,
        borderRadius: 8,
        border: "1px solid #666",
        textAlign: "left",
        background: obtained ? "#cfeecf" : "#d9d9d9",
        color: "#000",
        cursor: obtained ? "pointer" : "not-allowed",
        opacity: obtained ? 1 : 0.7,
      }}
    >
      {isNew && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#e53935",
          }}
        />
      )}
      {duplicateCount > 0 && (
        <span
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            padding: "2px 6px",
            borderRadius: 10,
            background: "#111",
            color: "#fff",
            fontSize: 12,
          }}
        >
          x{duplicateCount}
        </span>
      )}
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
