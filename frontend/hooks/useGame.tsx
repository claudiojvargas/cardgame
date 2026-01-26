import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CARDS } from "../../game/data/cards.catalog";
import { ProfileRepositoryLocalStorage } from "../../game/user/ProfileRepositoryLocalStorage";
import { ProfileService } from "../../game/user/ProfileService";
import type { CurrencyType, UserProfile } from "../../game/user/UserProfile";
import { createDefaultProfile } from "../../game/user/UserProfile";
import { Rarity } from "../../game/types/enums";

interface GameActions {
  renamePlayer: (displayName: string) => void;
  addCurrency: (type: CurrencyType, amount: number) => void;
  spendCurrency: (type: CurrencyType, amount: number) => void;
  addCard: (cardId: string, qty?: number) => void;
  removeCard: (cardId: string, qty?: number) => void;
  markCardNew: (cardId: string) => void;
  markAllAsSeen: () => void;
  setAwakening: (cardId: string, value: number) => void;
  setDeckIds: (deckIds: string[]) => void;
  recordTowerRunStart: () => void;
  recordTowerResult: (payload: { win: boolean; floor: number }) => void;
  recordChestOpened: (chestId: string) => void;
  recordCombine: (rarity: Rarity) => void;
  updateIncense: (rarity: Rarity, reset?: boolean) => void;
}

interface GameContextValue {
  profile: UserProfile;
  actions: GameActions;
  getIncenseThreshold: (rarity: Rarity) => number;
}

const GameContext = createContext<GameContextValue | null>(null);

function buildInitialProfile(stored: UserProfile | null) {
  if (stored) return stored;
  return createDefaultProfile();
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const repository = useMemo(() => new ProfileRepositoryLocalStorage(), []);
  const [service] = useState(() => {
    const stored = repository.load();
    return new ProfileService(repository, buildInitialProfile(stored));
  });
  const [profile, setProfile] = useState<UserProfile>(() => service.getProfile());

  const updateProfile = useCallback(
    (updater: (service: ProfileService) => UserProfile) => {
      setProfile(updater(service));
    },
    [service]
  );

  const actions = useMemo<GameActions>(
    () => ({
      renamePlayer: displayName => updateProfile(svc => svc.rename(displayName)),
      addCurrency: (type, amount) => updateProfile(svc => svc.addCurrency(type, amount)),
      spendCurrency: (type, amount) => updateProfile(svc => svc.spendCurrency(type, amount)),
      addCard: (cardId, qty) => updateProfile(svc => svc.addCard(cardId, qty)),
      removeCard: (cardId, qty) => updateProfile(svc => svc.removeCard(cardId, qty)),
      markCardNew: cardId => updateProfile(svc => svc.markCardNew(cardId)),
      markAllAsSeen: () => updateProfile(svc => svc.markAllAsSeen()),
      setAwakening: (cardId, value) => updateProfile(svc => svc.setAwakening(cardId, value)),
      setDeckIds: deckIds => updateProfile(svc => svc.setDeckIds(deckIds)),
      recordTowerRunStart: () => updateProfile(svc => svc.recordTowerRunStart()),
      recordTowerResult: payload => updateProfile(svc => svc.recordTowerResult(payload)),
      recordChestOpened: chestId => updateProfile(svc => svc.recordChestOpened(chestId)),
      recordCombine: rarity => updateProfile(svc => svc.recordCombine(rarity)),
      updateIncense: (rarity, reset) => updateProfile(svc => svc.updateIncense(rarity, reset)),
    }),
    [updateProfile]
  );

  const getIncenseThreshold = useCallback(
    (rarity: Rarity) => service.getIncenseThreshold(rarity),
    [service]
  );

  return (
    <GameContext.Provider value={{ profile, actions, getIncenseThreshold }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}

export function useCardRarityMap() {
  return useMemo(() => {
    return CARDS.reduce<Record<string, Rarity>>((acc, card) => {
      acc[card.id] = card.rarity;
      return acc;
    }, {});
  }, []);
}
