"use client";

import { useState, useEffect, useCallback } from "react";
import { Chore, ChoreCreate, ChoreUpdate } from "@/types";
import { apiFetch } from "@/lib/api";

export function useChores(familyId?: number) {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/chores/");
      if (!res.ok) throw new Error("Failed to fetch chores");
      const data: Chore[] = await res.json();
      // Filter by family_id if provided
      const filtered = familyId
        ? data.filter((c) => c.family_id === familyId)
        : data;
      setChores(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    fetchChores();
  }, [fetchChores]);

  const createChore = useCallback(async (chore: ChoreCreate): Promise<Chore | null> => {
    try {
      const res = await apiFetch("/chores/", {
        method: "POST",
        body: JSON.stringify(chore),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create chore");
      }
      const newChore: Chore = await res.json();
      setChores((prev) => [...prev, newChore]);
      return newChore;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, []);

  const updateChore = useCallback(
    async (id: number, updates: ChoreUpdate): Promise<Chore | null> => {
      try {
        const res = await apiFetch(`/chores/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to update chore");
        }
        const updated: Chore = await res.json();
        setChores((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    []
  );

  const deleteChore = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await apiFetch(`/chores/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete chore");
      setChores((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    }
  }, []);

  const completeChore = useCallback(async (id: number): Promise<Chore | null> => {
    try {
      const res = await apiFetch(`/chores/${id}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to complete chore");
      const updated: Chore = await res.json();
      setChores((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, []);

  const toggleComplete = useCallback(
    async (id: number): Promise<Chore | null> => {
      const chore = chores.find((c) => c.id === id);
      if (!chore) return null;

      if (!chore.completed) {
        // Use the complete endpoint
        return completeChore(id);
      } else {
        // Use update to uncomplete
        return updateChore(id, { completed: false });
      }
    },
    [chores, completeChore, updateChore]
  );

  return {
    chores,
    loading,
    error,
    refetch: fetchChores,
    createChore,
    updateChore,
    deleteChore,
    completeChore,
    toggleComplete,
  };
}
