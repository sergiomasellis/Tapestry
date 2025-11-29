"use client";

import { useState, useEffect, useCallback } from "react";
import { LeaderboardEntry } from "@/types";
import { apiFetch } from "@/lib/api";

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/points/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data: LeaderboardEntry[] = await res.json();
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
}

