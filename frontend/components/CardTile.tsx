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

function formatPowerDisplay(card: Card) {
  const buffPct = card.buffPowerPctTotal ?? 0;
  const effectivePower = Math.round(card.power * (1 + buffPct));
  if (buffPct > 0) {
    return `${effectivePower} (+${Math.round(buffPct * 100)}%)`;
  }
  return `${effectivePower}`;
}

function getStatusBadges(card: Card) {
  const badges: Array<{ label: string; emoji: string }> = [];
  if (card.buffPowerPctTotal > 0) {
    badges.push({ label: "Buff de poder", emoji: "⚡" });
  }
  if (card.shield) {
    badges.push({ label: "Escudo ativo", emoji: "🛡️" });
  }
  if (card.statusFrozenRounds > 0) {
    badges.push({ label: "Congelado", emoji: "❄️" });
  }
  if (card.dotList.length > 0) {
    badges.push({ label: "DOT ativo", emoji: "☠️" });
  }
  return badges;
}

interface Props {
  card: Card;
  obtained: boolean;
  isNew?: boolean;
  duplicateCount?: number;
  awakeningValue?: number;
  selectable?: boolean;
  onClick?: () => void;
}

export function CardTile({
  card,
  obtained,
  isNew = false,
  duplicateCount = 0,
  awakeningValue,
  selectable,
  onClick,
}: Props) {
  const awakeningDisplay = awakeningValue ?? card.awakening;
  const isSelectable = selectable ?? obtained;
  const cursor = !obtained ? "not-allowed" : isSelectable ? "pointer" : "default";
  const badges = getStatusBadges(card);
  return (
    <button
      type="button"
      onClick={obtained && isSelectable ? onClick : undefined}
      style={{
        position: "relative",
        height: 200,
        width: 140,
        padding: 12,
        margin: 6,
        borderRadius: 8,
        border: "1px solid #666",
        textAlign: "left",
        background: obtained ? getCardGradient(card) : "#d9d9d9",
        color: "#000",
        cursor,
        opacity: obtained ? 1 : 0.7,
      }}
    >
      {badges.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            display: "flex",
            gap: 4,
          }}
        >
          {badges.map(badge => (
            <span
              key={badge.label}
              title={badge.label}
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 6,
                padding: "2px 4px",
                fontSize: 12,
              }}
            >
              {badge.emoji}
            </span>
          ))}
        </div>
      )}
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
      <span
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          padding: "2px 6px",
          borderRadius: 10,
          background: "#e0e0e0",
          color: "#000",
          fontSize: 12,
        }}
      >
        Desp {awakeningDisplay}
      </span>
      <strong style={{ display: "block", marginBottom: 8 }}>
        {card.name}
      </strong>
      <div>Poder: {formatPowerDisplay(card)}</div>
      <div>Raridade: {card.rarity}</div>
      <div>Classe: {card.cardClass}</div>
    </button>
  );
}
