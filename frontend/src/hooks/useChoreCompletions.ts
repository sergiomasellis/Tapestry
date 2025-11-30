"use client";

import { useState, useEffect, useCallback } from "react";
import { ChoreCompletion } from "@/types";
import { apiFetch } from "@/lib/api";

export function useChoreCompletions(choreId?: number) {
  const [completions, setCompletions] = useState<ChoreCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionCount, setCompletionCount] = useState(0);

  const fetchCompletions = useCallback(async () => {
    if (!choreId) {
      setCompletions([]);
      setCompletionCount(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/chores/${choreId}/completions`);
      if (!res.ok) throw new Error("Failed to fetch completions");
      const data: ChoreCompletion[] = await res.json();
      setCompletions(data);
      setCompletionCount(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setCompletions([]);
      setCompletionCount(0);
    } finally {
      setLoading(false);
    }
  }, [choreId]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  return {
    completions,
    completionCount,
    loading,
    error,
    refetch: fetchCompletions,
  };
}

