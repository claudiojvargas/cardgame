import { useMemo, useState } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { Card } from "../../game/entities/Card";
import { getRarityConfig } from "../../game/config/rarity.config";
import { calculateCardPower } from "../../game/systems/powerCalculator";
import { CardClass, Rarity } from "../../game/types/enums";
import { useGame } from "../hooks/useGame";

type CollectionGroupId = "CLASS" | "RARITY";

interface CollectionEntry {
  id: string;
  label: string;
  groupId: CollectionGroupId;
  value: CardClass | Rarity;
}

const CLASS_LABELS: Record<CardClass, string> = {
  [CardClass.ATTACK]: "Attack",
  [CardClass.DEFENSE]: "Defense",
  [CardClass.SUPPORT]: "Support",
  [CardClass.CONTROL]: "Control",
  [CardClass.CONTINUOUS]: "Continuous",
  [CardClass.EVADE]: "Evade",
  [CardClass.CHAIN]: "Chain",
  [CardClass.STRATEGY]: "Strategy",
};

const CLASS_EFFECTS: Record<CardClass, string> = {
  [CardClass.ATTACK]: "Foca em dano direto e pressão rápida.",
  [CardClass.DEFENSE]: "Protege o time e reduz dano recebido.",
  [CardClass.SUPPORT]: "Fortalece aliados e adiciona utilidade.",
  [CardClass.CONTROL]: "Atrasa o inimigo com efeitos de controle.",
  [CardClass.CONTINUOUS]: "Dano ou efeitos constantes ao longo dos turnos.",
  [CardClass.EVADE]: "Desvia ataques e cria janelas de contra-ataque.",
  [CardClass.CHAIN]: "Combos que escalam conforme as sequências.",
  [CardClass.STRATEGY]: "Sinergias táticas e decisões de timing.",
};

const RARITY_LABELS: Record<Rarity, string> = {
  [Rarity.COMMON]: "Common",
  [Rarity.UNCOMMON]: "Uncommon",
  [Rarity.RARE]: "Rare",
  [Rarity.EPIC]: "Epic",
  [Rarity.LEGENDARY]: "Legendary",
  [Rarity.MYTHIC]: "Mythic",
  [Rarity.DIAMOND]: "Diamond",
};

const RARITY_ORDER: Rarity[] = [
  Rarity.DIAMOND,
  Rarity.MYTHIC,
  Rarity.LEGENDARY,
  Rarity.EPIC,
  Rarity.RARE,
  Rarity.UNCOMMON,
  Rarity.COMMON,
];

const COLLECTION_GROUPS: Array<{ id: CollectionGroupId; label: string; entries: CollectionEntry[] }> =
  [
    {
      id: "CLASS",
      label: "Por Classe",
      entries: Object.values(CardClass).map(cardClass => ({
        id: cardClass,
        label: CLASS_LABELS[cardClass],
        groupId: "CLASS",
        value: cardClass,
      })),
    },
    {
      id: "RARITY",
      label: "Por Raridade",
      entries: Object.values(Rarity).map(rarity => ({
        id: rarity,
        label: RARITY_LABELS[rarity],
        groupId: "RARITY",
        value: rarity,
      })),
    },
  ];

function getCollectionKey(entry: CollectionEntry) {
  return `${entry.groupId}:${entry.id}`;
}

export function CollectionScreen() {
  const { profile } = useGame();
  const [activeGroup, setActiveGroup] = useState<CollectionGroupId>("CLASS");
  const [selectedCollection, setSelectedCollection] = useState<CollectionEntry | null>(null);
  const [visitedCollections, setVisitedCollections] = useState<Record<string, boolean>>({});
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const groupsToShow = COLLECTION_GROUPS.filter(group => group.id === activeGroup);

  function getAwakeningValue(cardId: string) {
    return profile.collection.awakenings[cardId] ?? 0;
  }

  function handleOpenCollection(entry: CollectionEntry) {
    setSelectedCollection(entry);
    setVisitedCollections(current => ({
      ...current,
      [getCollectionKey(entry)]: true,
    }));
  }

  const collectionCards = useMemo(() => {
    if (!selectedCollection) return [];
    return CARDS.filter(card => {
      if (selectedCollection.groupId === "CLASS") {
        return card.cardClass === selectedCollection.value;
      }
      return card.rarity === selectedCollection.value;
    });
  }, [selectedCollection]);

  const collectionIndex = useMemo(() => {
    return collectionCards.reduce<Record<string, number>>((acc, card, index) => {
      acc[card.id] = index;
      return acc;
    }, {});
  }, [collectionCards]);

  const filteredCards = useMemo(() => {
    let current = [...collectionCards];

    current.sort((left, right) => {
      const leftOwned = (profile.collection.inventory[left.id] ?? 0) > 0;
      const rightOwned = (profile.collection.inventory[right.id] ?? 0) > 0;
      if (leftOwned !== rightOwned) {
        return leftOwned ? -1 : 1;
      }
      if (!leftOwned && !rightOwned) {
        return (collectionIndex[left.id] ?? 0) - (collectionIndex[right.id] ?? 0);
      }
      const rarityOrder = RARITY_ORDER.indexOf(left.rarity) - RARITY_ORDER.indexOf(right.rarity);
      if (rarityOrder !== 0) {
        return rarityOrder;
      }
      const leftPower = calculateCardPower({
        ...left,
        awakening: getAwakeningValue(left.id),
      });
      const rightPower = calculateCardPower({
        ...right,
        awakening: getAwakeningValue(right.id),
      });
      return rightPower - leftPower;
    });

    return current;
  }, [
    collectionCards,
    profile.collection.inventory,
    profile.collection.awakenings,
    collectionIndex,
  ]);

  if (selectedCollection) {
    const total = collectionCards.length;
    const owned = collectionCards.filter(
      card => (profile.collection.inventory[card.id] ?? 0) > 0
    ).length;
    const progress = total > 0 ? Math.round((owned / total) * 100) : 0;
    const selectedObtained =
      selectedCard && (profile.collection.inventory[selectedCard.id] ?? 0) > 0;

    return (
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <button
          type="button"
          onClick={() => setSelectedCollection(null)}
          style={{ alignSelf: "flex-start" }}
        >
          ← Voltar ao hub
        </button>

        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1>
            📂 Coleção {selectedCollection.label} · {owned}/{total}
          </h1>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: "#262626",
              overflow: "hidden",
              maxWidth: 480,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: progress === 100 ? "#4caf50" : "#42a5f5",
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: "#777" }}>
            {progress === 100
              ? "Coleção completa!"
              : "Complete cartas para desbloquear recompensas visuais."}
          </span>
        </header>

        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#888" }}>
            Exibindo cartas obtidas primeiro (raridade alta → baixa).
          </span>
        </section>

        <section>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            {filteredCards.map(card => {
              const ownedCount = profile.collection.inventory[card.id] ?? 0;
              const obtained = ownedCount > 0;
              const awakening = getAwakeningValue(card.id);
              const isNew = profile.collection.isNew[card.id] ?? false;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedCard(card)}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #333",
                    background: obtained ? "#1f1f1f" : "#121212",
                    color: "#f5f5f5",
                    minHeight: 180,
                    position: "relative",
                  }}
                >
                  {isNew && (
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "#ff7043",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      NOVO
                    </span>
                  )}
                  <div
                    style={{
                      height: 80,
                      borderRadius: 10,
                      background: obtained ? "#2e2e2e" : "#000",
                      border: obtained ? "1px solid #444" : "1px dashed #333",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: obtained ? "#f5f5f5" : "#555",
                      marginBottom: 10,
                      fontSize: 12,
                    }}
                  >
                    {obtained ? "Arte da carta" : "Silhueta"}
                  </div>
                  <strong style={{ display: "block", marginBottom: 6 }}>
                    {obtained ? card.name : "???"}
                  </strong>
                  {obtained ? (
                    <>
                      <div style={{ fontSize: 12, color: "#bbb" }}>
                        Raridade: {RARITY_LABELS[card.rarity]}
                      </div>
                      <div style={{ fontSize: 12, color: "#bbb" }}>
                        Despertar: {awakening}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: "#777" }}>
                      Dica: encontre em baús.
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {selectedCard && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            onClick={() => setSelectedCard(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              onClick={event => event.stopPropagation()}
              style={{
                background: "#111",
                borderRadius: 16,
                padding: 24,
                width: "min(480px, 90vw)",
                color: "#f5f5f5",
                border: "1px solid #333",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>
                  {selectedObtained ? selectedCard.name : "Carta desconhecida"}
                </h2>
                <button type="button" onClick={() => setSelectedCard(null)}>
                  ✕
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span>
                  Classe: {selectedObtained ? CLASS_LABELS[selectedCard.cardClass] : "???"}
                </span>
                <span>
                  Raridade: {selectedObtained ? RARITY_LABELS[selectedCard.rarity] : "???"}
                </span>
                <span>Região: {selectedObtained ? selectedCard.regiao : "???"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span>Base Power: {selectedObtained ? selectedCard.basePower : "???"}</span>
                <span>
                  Despertar: {selectedObtained
                    ? `${getAwakeningValue(selectedCard.id)} / ${getRarityConfig(selectedCard.rarity).maxAwakening}`
                    : "???"}
                </span>
              </div>
              <p style={{ margin: 0, color: "#bbb" }}>
                {selectedObtained
                  ? CLASS_EFFECTS[selectedCard.cardClass]
                  : "Encontre essa carta em baús ou eventos especiais."}
              </p>
              {selectedObtained && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong>História</strong>
                  <p style={{ margin: 0, color: "#bbb" }}>{selectedCard.historia}</p>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span>
                  Status: {selectedObtained ? "Obtida" : "Não obtida"}
                  {profile.collection.isNew[selectedCard.id] ? " · Nova" : ""}
                </span>
                {(profile.collection.inventory[selectedCard.id] ?? 0) > 1 && (
                  <span>
                    Duplicatas: {Math.max(0, (profile.collection.inventory[selectedCard.id] ?? 0) - 1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1>📂 Coleção</h1>
        <p>Explore as coleções por classe ou raridade.</p>
      </header>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {COLLECTION_GROUPS.map(group => (
          <button
            key={group.id}
            type="button"
            onClick={() => setActiveGroup(group.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid #444",
              background: activeGroup === group.id ? "#f5f5f5" : "#1b1b1b",
              color: activeGroup === group.id ? "#111" : "#f5f5f5",
            }}
          >
            {group.id === "CLASS" ? "Classe" : "Raridade"}
          </button>
        ))}
      </div>

      {groupsToShow.map(group => (
        <section key={group.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2>{group.label}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {group.entries.map(entry => {
              const collectionCards = CARDS.filter(card => {
                if (entry.groupId === "CLASS") {
                  return card.cardClass === entry.value;
                }
                return card.rarity === entry.value;
              });
              const total = collectionCards.length;
              const owned = collectionCards.filter(
                card => (profile.collection.inventory[card.id] ?? 0) > 0
              ).length;
              const progress = total > 0 ? Math.round((owned / total) * 100) : 0;
              const hasNew = collectionCards.some(
                card => profile.collection.isNew[card.id]
              );
              const isVisited = visitedCollections[getCollectionKey(entry)] ?? false;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleOpenCollection(entry)}
                  style={{
                    textAlign: "left",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #333",
                    background: "#141414",
                    color: "#f5f5f5",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {hasNew && !isVisited && (
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "#ff7043",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      NOVO
                    </span>
                  )}
                  <strong style={{ fontSize: 16 }}>{entry.label}</strong>
                  <span style={{ fontSize: 12, color: "#bbb" }}>
                    Progresso: {owned}/{total}
                  </span>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: "#262626",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: progress === 100 ? "#4caf50" : "#42a5f5",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "#999" }}>
                    {progress === 100 ? "🏅 Coleção completa" : "⭐ Continue coletando"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
