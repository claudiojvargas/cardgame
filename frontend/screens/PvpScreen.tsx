import { useEffect, useMemo, useRef, useState } from "react";
import { GameBoard } from "../components/GameBoard";
import { useBattle } from "../hooks/useBattle";
import { createPlayer } from "../gameSetup";
import { Player } from "../../game/entities/Player";
import { GameState } from "../../game/core/GameState";
import { GameStatus } from "../../game/types/enums";
import { createSeededRng } from "../../game/utils/random";
import { TowerEnemyFactory } from "../../game/tower/TowerEnemyFactory";
import {
  fetchPvpSnapshot,
  postPvpMatchResult,
  type LeaderboardEntry,
  type MatchHistoryEntry,
  type PvpMatchResultPayload,
} from "../utils/pvpApi";
import { useGame } from "../hooks/useGame";

const DEFAULT_PLAYER_SUMMARY = {
  name: "Jogador",
  rank: "Ouro II",
  rating: 1340,
  wins: 18,
  losses: 9,
  winRate: 67,
  bestRank: "Platina III",
  placementMatchesRemaining: 5,
};

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: "lb-1", name: "Atlas Prime", rank: "Diamante", rating: 1820, streak: 7 },
  { id: "lb-2", name: "Valkyrie", rank: "Diamante", rating: 1775, streak: 5 },
  { id: "lb-3", name: "Trovão", rank: "Platina", rating: 1692, streak: 4 },
  { id: "lb-4", name: "Eclipse", rank: "Platina", rating: 1650, streak: 3 },
  { id: "lb-5", name: "Aurora", rank: "Ouro", rating: 1580, streak: 2 },
];

const DEFAULT_HISTORY: MatchHistoryEntry[] = [
  {
    id: "match-1",
    rival: "Lyra do Abismo",
    result: "win",
    delta: 22,
    playedAt: "Hoje, 14:32",
  },
  {
    id: "match-2",
    rival: "Cavaleiro Azul",
    result: "loss",
    delta: -18,
    playedAt: "Hoje, 12:18",
  },
  {
    id: "match-3",
    rival: "Mística Solária",
    result: "win",
    delta: 16,
    playedAt: "Ontem, 20:05",
  },
];

const PVP_SNAPSHOT_KEY = "pvp-snapshot-v1";

export function PvpScreen() {
  const { profile } = useGame();
  const rng = useMemo(() => createSeededRng(Date.now()), []);
  const [battleActive, setBattleActive] = useState(false);
  const [activeRival, setActiveRival] = useState<string | null>(null);
  const [activeMatchId, setActiveMatchId] = useState(0);
  const lastResolvedMatchId = useRef<number | null>(null);
  const [initialState, setInitialState] = useState<GameState>(() =>
    createIdleState(rng)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [playerSummary, setPlayerSummary] = useState(() => ({
    ...DEFAULT_PLAYER_SUMMARY,
    name: profile.displayName,
  }));

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARD);

  const [history, setHistory] =
    useState<MatchHistoryEntry[]>(DEFAULT_HISTORY);

  const {
    state,
    playerAttack,
    lastAiAction,
    lastCombatEvents,
    phase,
    isAiThinking,
    skipAiTurn,
  } = useBattle(initialState);

  function startBattle(rivalName: string) {
    setActiveRival(rivalName);
    setActiveMatchId(Date.now());
    setInitialState(createGameState(rng));
    setBattleActive(true);
  }

  function exitBattle() {
    setBattleActive(false);
    setActiveRival(null);
    setInitialState(createIdleState(rng));
  }

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (typeof window !== "undefined") {
        const cached = window.localStorage.getItem(PVP_SNAPSHOT_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as {
              summary?: typeof DEFAULT_PLAYER_SUMMARY;
              leaderboard?: LeaderboardEntry[];
              history?: MatchHistoryEntry[];
            };
            setPlayerSummary({
              ...DEFAULT_PLAYER_SUMMARY,
              ...parsed.summary,
              name: profile.displayName,
            });
            setLeaderboard(parsed.leaderboard ?? DEFAULT_LEADERBOARD);
            setHistory(parsed.history ?? DEFAULT_HISTORY);
          } catch {
            // ignore cache parse errors
          }
        }
      }

      const snapshot = await fetchPvpSnapshot(controller.signal);
      if (!snapshot) {
        setLoadError("Não foi possível carregar o ranking agora.");
        setIsLoading(false);
        return;
      }
      if (snapshot.error) {
        setLoadError(snapshot.error);
      } else {
        setLoadError(null);
      }
      setPlayerSummary({
        ...DEFAULT_PLAYER_SUMMARY,
        ...snapshot.summary,
        name: profile.displayName,
      });
      setLeaderboard(snapshot.leaderboard ?? DEFAULT_LEADERBOARD);
      setHistory(snapshot.history ?? DEFAULT_HISTORY);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          PVP_SNAPSHOT_KEY,
          JSON.stringify({
            summary: {
              ...DEFAULT_PLAYER_SUMMARY,
              ...snapshot.summary,
              name: profile.displayName,
            },
            leaderboard: snapshot.leaderboard ?? DEFAULT_LEADERBOARD,
            history: snapshot.history ?? DEFAULT_HISTORY,
          })
        );
      }
      setIsLoading(false);
    };
    void load();
    return () => controller.abort();
  }, [profile.displayName]);

  useEffect(() => {
    setPlayerSummary(prev => ({ ...prev, name: profile.displayName }));
    setLeaderboard(prev => {
      const next = prev.map(entry =>
        entry.id === "player" ? { ...entry, name: profile.displayName } : entry
      );
      return next;
    });
    if (typeof window !== "undefined") {
      try {
        const cached = window.localStorage.getItem(PVP_SNAPSHOT_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            summary?: typeof DEFAULT_PLAYER_SUMMARY;
            leaderboard?: LeaderboardEntry[];
            history?: MatchHistoryEntry[];
          };
          window.localStorage.setItem(
            PVP_SNAPSHOT_KEY,
            JSON.stringify({
              ...parsed,
              summary: {
                ...DEFAULT_PLAYER_SUMMARY,
                ...parsed.summary,
                name: profile.displayName,
              },
            })
          );
        }
      } catch {
        // ignore cache errors
      }
    }
  }, [profile.displayName]);

  useEffect(() => {
    if (!battleActive) return;
    if (state.status !== GameStatus.FINISHED) return;
    if (lastResolvedMatchId.current === activeMatchId) return;

    const win = state.winnerId === "Player";
    const delta = win ? 20 : -15;
    const playedAt = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setPlayerSummary(prev => {
      const wins = prev.wins + (win ? 1 : 0);
      const losses = prev.losses + (win ? 0 : 1);
      const total = wins + losses;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : prev.winRate;
      const placementMatchesRemaining =
        prev.placementMatchesRemaining > 0
          ? prev.placementMatchesRemaining - 1
          : 0;

      return {
        ...prev,
        rating: prev.rating + delta,
        wins,
        losses,
        winRate,
        placementMatchesRemaining,
      };
    });

    setHistory(prev => [
      {
        id: `match-${activeMatchId}`,
        rival: activeRival ?? "Bot de colocação",
        result: win ? "win" : "loss",
        delta,
        playedAt: `Hoje, ${playedAt}`,
      },
      ...prev,
    ]);

    setLeaderboard(prev => {
      const updated = prev.filter(entry => entry.id !== "player");
      updated.push({
        id: "player",
        name: playerSummary.name,
        rank: playerSummary.rank,
        rating: playerSummary.rating + delta,
        streak: win ? 1 : 0,
      });
      return updated.sort((a, b) => b.rating - a.rating).slice(0, 6);
    });

    const payload: PvpMatchResultPayload = {
      matchId: String(activeMatchId),
      opponent: activeRival ?? "Bot de colocação",
      result: win ? "win" : "loss",
      delta,
      finishedAt: new Date().toISOString(),
    };
    void postPvpMatchResult(payload);

    lastResolvedMatchId.current = activeMatchId;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        PVP_SNAPSHOT_KEY,
        JSON.stringify({
          summary: {
            ...playerSummary,
            rating: playerSummary.rating + delta,
            wins: playerSummary.wins + (win ? 1 : 0),
            losses: playerSummary.losses + (win ? 0 : 1),
            winRate: Math.round(
              ((playerSummary.wins + (win ? 1 : 0)) /
                (playerSummary.wins +
                  playerSummary.losses +
                  1)) *
                100
            ),
            placementMatchesRemaining:
              playerSummary.placementMatchesRemaining > 0
                ? playerSummary.placementMatchesRemaining - 1
                : 0,
          },
          leaderboard: leaderboard
            .filter(entry => entry.id !== "player")
            .concat([
              {
                id: "player",
                name: playerSummary.name,
                rank: playerSummary.rank,
                rating: playerSummary.rating + delta,
                streak: win ? 1 : 0,
              },
            ])
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6),
          history: [
            {
              id: `match-${activeMatchId}`,
              rival: activeRival ?? "Bot de colocação",
              result: win ? "win" : "loss",
              delta,
              playedAt: `Hoje, ${playedAt}`,
            },
            ...history,
          ],
        })
      );
    }
  }, [
    activeMatchId,
    activeRival,
    battleActive,
    playerSummary.name,
    playerSummary.rank,
    playerSummary.rating,
    state.status,
    state.winnerId,
    history,
    leaderboard,
  ]);

  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {battleActive ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 280px",
            gap: 16,
            minHeight: 0,
          }}
        >
          <GameBoard
            state={state}
            onAttack={playerAttack}
            lastAiDefenderId={lastAiAction?.defenderId ?? null}
            lastAiAction={lastAiAction}
            lastCombatEvents={lastCombatEvents}
            isAiThinking={isAiThinking}
            onSkipAiDelay={skipAiTurn}
          />
          <aside
            style={{
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <h2 style={{ marginTop: 0 }}>Partida PvP</h2>
              <p style={{ margin: 0, color: "#666" }}>
                Rival: {activeRival ?? "Bot de colocação"}
              </p>
            </div>
            <div>
              <h3 style={{ marginTop: 0 }}>Fase</h3>
              <p style={{ margin: 0, color: "#333" }}>{phase}</p>
            </div>
            <button type="button" onClick={exitBattle}>
              Sair da partida
            </button>
          </aside>
        </div>
      ) : (
        <>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ margin: 0 }}>⚔️ Arena PvP</h1>
              <p style={{ margin: 0, color: "#666" }}>
                Temporada 1 • Combates com decks reais e IA tática.
              </p>
            </div>
            <div
              style={{
                background: "#111",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
              }}
            >
              <span style={{ fontWeight: 600 }}>Seu Rank</span>
              <span>{playerSummary.rank}</span>
              <span style={{ color: "#f5c542" }}>• {playerSummary.rating} Elo</span>
            </div>
          </header>

          {playerSummary.placementMatchesRemaining > 0 && (
            <section
              style={{
                background: "#fff7e6",
                border: "1px solid #ffe0b2",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong>Partidas de colocação</strong>
                <p style={{ margin: "4px 0 0", color: "#8d6e63" }}>
                  Nas primeiras {playerSummary.placementMatchesRemaining} partidas,
                  você enfrenta bots para calibrar seu ranking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => startBattle("Bot de colocação")}
              >
                🎯 Jogar colocação
              </button>
            </section>
          )}

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #e0e0e0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Perfil competitivo</h2>
                  <p style={{ margin: "4px 0 0", color: "#666" }}>
                    Última atualização: agora mesmo
                  </p>
                </div>
                <button type="button" onClick={() => startBattle("Rival aleatório")}>
                  🎯 Encontrar partida
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                }}
              >
                <StatCard label="Jogador" value={playerSummary.name} />
                <StatCard label="Vitórias" value={playerSummary.wins} />
                <StatCard label="Derrotas" value={playerSummary.losses} />
                <StatCard label="Win Rate" value={`${playerSummary.winRate}%`} />
                <StatCard label="Melhor Rank" value={playerSummary.bestRank} />
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #e0e0e0",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <h2 style={{ margin: 0 }}>Ranking Global</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px 1fr auto",
                      gap: 12,
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 12,
                      background: index === 0 ? "#fef7e0" : "#f7f7f7",
                    }}
                  >
                    <strong>#{index + 1}</strong>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{entry.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                        {entry.rank} • {entry.rating} Elo
                      </p>
                    </div>
                    <span style={{ fontSize: 12, color: "#333" }}>
                      🔥 {entry.streak} vit.
                    </span>
                  </div>
                ))}
              </div>
              <button type="button" style={{ marginTop: 8 }}>
                Ver ranking completo
              </button>
            </div>
          </section>

          <section
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              border: "1px solid #e0e0e0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ margin: 0 }}>Histórico recente</h2>
              {isLoading && (
                <span style={{ fontSize: 12, color: "#666" }}>
                  Atualizando ranking...
                </span>
              )}
            </div>
            {loadError && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "#fff3e0",
                  color: "#8d6e63",
                  fontSize: 12,
                }}
              >
                {loadError}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map(match => (
                <div
                  key={match.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: match.result === "win" ? "#e9f7ef" : "#fdecea",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{match.rival}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                      {match.playedAt}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {match.result === "win" ? "Vitória" : "Derrota"}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: match.delta > 0 ? "#2e7d32" : "#c62828",
                      }}
                    >
                      {match.delta > 0 ? "+" : ""}
                      {match.delta} Elo
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button type="button">Ver histórico completo</button>
          </section>
        </>
      )}

      {battleActive && state.status === GameStatus.FINISHED && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255, 255, 255, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: 16,
              padding: 24,
              minWidth: 280,
              textAlign: "center",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {state.winnerId === "Player" ? (
              <h2 style={{ margin: 0 }}>✅ Vitória!</h2>
            ) : (
              <h2 style={{ margin: 0 }}>❌ Derrota</h2>
            )}
            <p style={{ margin: 0, color: "#666" }}>
              {state.winnerId === "Player"
                ? "Você venceu o duelo PvP."
                : "Seu rival levou a melhor desta vez."}
            </p>
            <button type="button" onClick={exitBattle}>
              Voltar para PvP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: "#f7f7f7",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontSize: 12, color: "#777" }}>{label}</span>
      <strong style={{ fontSize: 14 }}>{value}</strong>
    </div>
  );
}

function createGameState(rng: ReturnType<typeof createSeededRng>) {
  const player = createPlayer(rng);
  const enemyDeck = TowerEnemyFactory.createEnemy(1);
  const enemy = new Player("AI", enemyDeck, rng);
  return new GameState(
    [player, enemy],
    rng.next() > 0.5 ? 0 : 1,
    1,
    GameStatus.IN_PROGRESS,
    undefined,
    rng
  );
}

function createIdleState(rng: ReturnType<typeof createSeededRng>) {
  const player = createPlayer(rng);
  const enemyDeck = TowerEnemyFactory.createEnemy(1);
  const enemy = new Player("AI", enemyDeck, rng);
  return new GameState(
    [player, enemy],
    0,
    0,
    GameStatus.FINISHED,
    undefined,
    rng
  );
}
