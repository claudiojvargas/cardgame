import { Card } from "../../game/entities/Card";

const INVENTORY_KEY = "player-inventory";
const WALLET_KEY = "player-wallet";

export interface PlayerInventory {
  counts: Record<string, number>;
  newCards: string[];
  awakenings: Record<string, number>;
}

export interface PlayerWallet {
  gold: number;
  diamonds: number;
}

export function loadInventory(defaultCards: Card[]): PlayerInventory {
  if (typeof window === "undefined") {
    return buildInventory(defaultCards);
  }

  try {
    const raw = window.localStorage.getItem(INVENTORY_KEY);
    if (!raw) {
      return buildInventory(defaultCards);
    }
    const parsed = JSON.parse(raw) as PlayerInventory;
    if (!parsed || typeof parsed !== "object") {
      return buildInventory(defaultCards);
    }
    return {
      counts: parsed.counts ?? {},
      newCards: Array.isArray(parsed.newCards) ? parsed.newCards : [],
      awakenings: parsed.awakenings ?? {},
    };
  } catch {
    return buildInventory(defaultCards);
  }
}

export function saveInventory(inventory: PlayerInventory) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

export function loadWallet(): PlayerWallet {
  if (typeof window === "undefined") {
    return { gold: 0, diamonds: 0 };
  }

  try {
    const raw = window.localStorage.getItem(WALLET_KEY);
    if (!raw) {
      return { gold: 0, diamonds: 0 };
    }
    const parsed = JSON.parse(raw) as PlayerWallet;
    return {
      gold: Number(parsed?.gold ?? 0),
      diamonds: Number(parsed?.diamonds ?? 0),
    };
  } catch {
    return { gold: 0, diamonds: 0 };
  }
}

export function saveWallet(wallet: PlayerWallet) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
}

function buildInventory(cards: Card[]): PlayerInventory {
  const counts: Record<string, number> = {};
  const newCards: string[] = [];
  const awakenings: Record<string, number> = {};

  cards.forEach(card => {
    counts[card.id] = (counts[card.id] ?? 0) + 1;
    awakenings[card.id] = awakenings[card.id] ?? 0;
    if (!newCards.includes(card.id)) {
      newCards.push(card.id);
    }
  });

  return { counts, newCards, awakenings };
}
