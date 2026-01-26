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
        margin: "var(--space-1)",
        borderRadius: 8,
        border: "1px solid #666",
        textAlign: "left",
        background: obtained ? getCardBackground(card) : "#d9d9d9",
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
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
        title={`Classe: ${card.cardClass}`}
      >
        {CLASS_ICONS[card.cardClass]}
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
            bottom: "var(--space-1)",
            left: "var(--space-1)",
            padding: "var(--space-1)",
            borderRadius: 10,
            background: "#111",
            color: "#fff",
            fontSize: 14,
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
          padding: "var(--space-1)",
          borderRadius: 10,
          background: "#e0e0e0",
          color: "#000",
          fontSize: 14,
        }}
      >
        Desp {awakeningDisplay}
      </span>
      <strong style={{ display: "block", marginBottom: "var(--space-1)" }}>
        {card.name}
      </strong>
      <div
        style={{
          marginBottom: "var(--space-1)",
          height: 96,
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.7)",
          backgroundImage: obtained ? `url(${cardImageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
          filter: obtained ? "none" : "grayscale(100%)",
        }}
        title={obtained ? `Imagem da carta ${card.name}` : undefined}
      />
      <div>Poder: {formatPowerDisplay(card, awakeningDisplay)}</div>
      <div>Raridade: {card.rarity}</div>
      <div>Classe: {card.cardClass}</div>
      <div>Região: {card.regiao}</div>
    </button>
  );
}
