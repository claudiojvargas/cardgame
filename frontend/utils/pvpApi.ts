export type PvpPlayerSummary = {
  name: string;
  rank: string;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  bestRank: string;
  placementMatchesRemaining: number;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  rank: string;
  rating: number;
  streak: number;
};

export type MatchHistoryEntry = {
  id: string;
  rival: string;
  result: "win" | "loss";
  delta: number;
  playedAt: string;
};

export type PvpSnapshot = {
  summary?: PvpPlayerSummary;
  leaderboard?: LeaderboardEntry[];
  history?: MatchHistoryEntry[];
};

export type PvpMatchResultPayload = {
  matchId: string;
  opponent: string;
  result: "win" | "loss";
  delta: number;
  finishedAt: string;
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPvpSnapshot(signal?: AbortSignal) {
  return fetchJson<PvpSnapshot>("/api/pvp/summary", { signal });
}

export async function postPvpMatchResult(payload: PvpMatchResultPayload) {
  try {
    await fetch("/api/pvp/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore network errors for now
  }
}
