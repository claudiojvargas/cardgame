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
  onClick?: () => void;
  selectable?: boolean;
  style?: CSSProperties;
}

export function CardView({ card, onClick, selectable, style }: Props) {
  const badges = getStatusBadges(card);
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
      {badges.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 6,
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
      <strong>{card.name}</strong>
      <div>Power: {formatPowerDisplay(card)}</div>
      <div>{card.cardClass}</div>
      <div>{card.rarity}</div>
    </div>
  );
}
