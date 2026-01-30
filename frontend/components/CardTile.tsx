import { Card } from "../../game/entities/Card";
import { calculateCardPower } from "../../game/systems/powerCalculator";
import { getDots, getFrozenRounds, getShield } from "../../game/systems/StatusSystem";
import { CardClass, Rarity } from "../../game/types/enums";
import { getCardImageUrl } from "../utils/cardImages";

const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: "#9e9e9e",
  [Rarity.UNCOMMON]: "#43a047",
  [Rarity.RARE]: "#1e88e5",
  [Rarity.EPIC]: "#8e24aa",
  [Rarity.LEGENDARY]: "#f9a825",
  [Rarity.MYTHIC]: "#d32f2f",
  [Rarity.DIAMOND]: "#26c6da",
};

const CLASS_ICONS: Record<CardClass, string> = {
  [CardClass.ATTACK]: "⚔️",
  [CardClass.DEFENSE]: "🛡️",
  [CardClass.SUPPORT]: "✨",
  [CardClass.CONTROL]: "🧿",
  [CardClass.CONTINUOUS]: "🔁",
  [CardClass.EVADE]: "💨",
  [CardClass.CHAIN]: "⛓️",
  [CardClass.STRATEGY]: "🧠",
};

function getCardBackground(card: Card) {
  return RARITY_COLORS[card.rarity];
}

function formatPowerDisplay(card: Card, awakeningLevel?: number) {
  const buffPct = card.buffPowerPctTotal ?? 0;
  const basePower = calculateCardPower({
    ...card,
    awakening: awakeningLevel ?? card.awakening,
  });
  const effectivePower = Math.round(basePower * (1 + buffPct));
  if (buffPct > 0) {
    return `${effectivePower} (+${Math.round(buffPct * 100)}%)`;
  }
  return `${basePower}`;
}

function getStatusBadges(card: Card) {
  const badges: Array<{ label: string; emoji: string }> = [];
  if (card.buffPowerPctTotal > 0) {
    badges.push({ label: "Buff de poder", emoji: "⚡" });
  }
  if (getShield(card)) {
    badges.push({ label: "Escudo ativo", emoji: "🛡️" });
  }
  if (getFrozenRounds(card) > 0) {
    badges.push({ label: "Congelado", emoji: "❄️" });
  }
  if (getDots(card).length > 0) {
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
  const cardImageUrl = getCardImageUrl(card.id);
  return (
    <button
      type="button"
      onClick={obtained && isSelectable ? onClick : undefined}
      style={{
        position: "relative",
        height: "auto",
        width: "var(--card-ui-width)",
        aspectRatio: "var(--card-ui-aspect)",
        padding: "var(--space-2)",
        margin: "var(--card-ui-margin, var(--space-1))",
        borderRadius: 8,
        border: "1px solid #666",
        textAlign: "left",
        background: obtained
          ? `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.75)), url(${cardImageUrl})`
          : "#d9d9d9",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#000",
        cursor,
        opacity: obtained ? 1 : 0.7,
      }}
    >
      {badges.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "var(--space-1)",
            left: "var(--space-1)",
            display: "flex",
            gap: "var(--space-1)",
          }}
        >
          {badges.map(badge => (
            <span
              key={badge.label}
              title={badge.label}
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 8,
                padding: "var(--space-1)",
                fontSize: 14,
              }}
            >
              {badge.emoji}
            </span>
          ))}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: "var(--space-1)",
          right: "var(--space-1)",
          minWidth: 36,
          height: 24,
          borderRadius: 999,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "#fff",
          padding: "0 var(--space-1)",
        }}
        title={`Poder: ${formatPowerDisplay(card, awakeningDisplay)}`}
      >
        {formatPowerDisplay(card, awakeningDisplay)}
        {isNew && (
          <span
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#e53935",
            }}
          />
        )}
      </div>
      {duplicateCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "var(--space-1)",
            left: "var(--space-1)",
            padding: "2px 6px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            fontSize: 11,
          }}
        >
          x{duplicateCount}
        </span>
      )}
      <span
        style={{
          position: "absolute",
          bottom: "var(--space-1)",
          right: "var(--space-1)",
          padding: "2px 6px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          fontSize: 12,
        }}
      >
        {awakeningDisplay}
      </span>
      <span
        style={{
          position: "absolute",
          bottom: "var(--space-1)",
          left: "var(--space-1)",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
        }}
        title={`Classe: ${card.cardClass}`}
      >
        {CLASS_ICONS[card.cardClass]}
      </span>
    </button>
  );
}
