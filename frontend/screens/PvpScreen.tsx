import { useEffect, useMemo, useRef, useState } from "react";
import { GameBoard } from "../components/GameBoard";
import { useBattle } from "../hooks/useBattle";
import { createPlayer } from "../gameSetup";
import { Player } from "../../game/entities/Player";
import { GameState } from "../../game/core/GameState";
import { GameStatus } from "../../game/types/enums";
import { createSeededRng } from "../../game/utils/random";
import { TowerEnemyFactory } from "../../game/tower/TowerEnemyFactory";

type RivalPreview = {
  id: string;
  name: string;
  rank: string;
  deckPower: number;
  winRate: number;
  badge: string;
};

type MatchHistoryEntry = {
  id: string;
  rival: string;
  result: "win" | "loss";
  delta: number;
  playedAt: string;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  rank: string;
  rating: number;
  streak: number;
};

type LiveBattle = {
  id: string;
  playerA: string;
  playerB: string;
  turn: number;
  status: "em andamento" | "finalizando";
};

export function PvpScreen() {
  const rng = useMemo(() => createSeededRng(Date.now()), []);
  const [battleActive, setBattleActive] = useState(false);
  const [activeRival, setActiveRival] = useState<string | null>(null);
  const [activeMatchId, setActiveMatchId] = useState(0);
  const lastResolvedMatchId = useRef<number | null>(null);
  const [initialState, setInitialState] = useState<GameState>(() =>
    createIdleState(rng)
  );
  const [playerSummary, setPlayerSummary] = useState(() => ({
    name: "Mestre do Baralho",
    rank: "Ouro II",
    rating: 1340,
    wins: 18,
    losses: 9,
    winRate: 67,
    bestRank: "Platina III",
    placementMatchesRemaining: 5,
  }));

  const rivals = useMemo<RivalPreview[]>(
    () => [
      {
        id: "rival-1",
        name: "Lyra do Abismo",
        rank: "Ouro I",
        deckPower: 1420,
        winRate: 61,
        badge: "🔥",
      },
      {
        id: "rival-2",
        name: "Cavaleiro Azul",
        rank: "Prata I",
        deckPower: 1290,
        winRate: 54,
        badge: "⚔️",
      },
      {
        id: "rival-3",
        name: "Mística Solária",
        rank: "Ouro III",
        deckPower: 1388,
        winRate: 58,
        badge: "✨",
      },
    ],
    []
  );

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { id: "lb-1", name: "Atlas Prime", rank: "Diamante", rating: 1820, streak: 7 },
    { id: "lb-2", name: "Valkyrie", rank: "Diamante", rating: 1775, streak: 5 },
    { id: "lb-3", name: "Trovão", rank: "Platina", rating: 1692, streak: 4 },
    { id: "lb-4", name: "Eclipse", rank: "Platina", rating: 1650, streak: 3 },
    { id: "lb-5", name: "Aurora", rank: "Ouro", rating: 1580, streak: 2 },
  ]);

  const [history, setHistory] = useState<MatchHistoryEntry[]>([
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
  ]);

  const liveBattles = useMemo<LiveBattle[]>(
    () => [
      {
        id: "live-1",
        playerA: "Atlas Prime",
        playerB: "Valkyrie",
        turn: 6,
        status: "em andamento",
      },
      {
        id: "live-2",
        playerA: "Aurora",
        playerB: "Trovão",
        turn: 4,
        status: "finalizando",
      },
      {
        id: "live-3",
        playerA: "Mística Solária",
        playerB: "Eclipse",
        turn: 7,
        status: "em andamento",
      },
    ],
    []
  );

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

    lastResolvedMatchId.current = activeMatchId;
  }, [
    activeMatchId,
    activeRival,
    battleActive,
    playerSummary.name,
    playerSummary.rank,
    playerSummary.rating,
    state.status,
    state.winnerId,
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
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
              gap: 16,
            }}
          >
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
              <h2 style={{ margin: 0 }}>Rivais sugeridos</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                {rivals.map(rival => (
                  <div
                    key={rival.id}
                    style={{
                      borderRadius: 14,
                      border: "1px solid #e6e6e6",
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{rival.name}</strong>
                      <span>{rival.badge}</span>
                    </div>
                    <p style={{ margin: 0, color: "#666", fontSize: 12 }}>
                      {rival.rank} • Poder {rival.deckPower}
                    </p>
                    <p style={{ margin: 0, color: "#444", fontSize: 12 }}>
                      {rival.winRate}% win rate
                    </p>
                    <button type="button" onClick={() => startBattle(rival.name)}>
                      Enfrentar
                    </button>
                  </div>
                ))}
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
              <h2 style={{ margin: 0 }}>Histórico recente</h2>
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
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 16,
            }}
          >
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
              <h2 style={{ margin: 0 }}>Batalhas em andamento</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {liveBattles.map(battle => (
                  <div
                    key={battle.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "#f5f5f5",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <strong>
                      {battle.playerA} vs {battle.playerB}
                    </strong>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "#555",
                      }}
                    >
                      <span>Turno {battle.turn}</span>
                      <span>{battle.status}</span>
                    </div>
                    <button type="button" style={{ alignSelf: "flex-start" }}>
                      Assistir replay
                    </button>
                  </div>
                ))}
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
              <h2 style={{ margin: 0 }}>Desafios rápidos</h2>
              <p style={{ margin: 0, color: "#666" }}>
                Escolha um rival aleatório e ganhe bônus de elo se vencer.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button type="button" onClick={() => startBattle("Desafio relâmpago")}>
                  ⚡ Desafio relâmpago (+12 Elo)
                </button>
                <button type="button" onClick={() => startBattle("Desafio aleatório")}>
                  🎲 Desafio aleatório (+8 Elo)
                </button>
                <button type="button" onClick={() => startBattle("Desafio estratégico")}>
                  🧠 Desafio estratégico (+15 Elo)
                </button>
              </div>
            </div>
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
