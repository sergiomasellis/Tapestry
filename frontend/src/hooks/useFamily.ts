"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export type Family = {
  id: number;
  name: string;
  created_at: string;
};

export function useFamily() {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFamily = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/families/");
      if (!res.ok) throw new Error("Failed to fetch families");
      const families: Family[] = await res.json();
      // Use the first family if available, or null if none exist
      setFamily(families.length > 0 ? families[0] : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const createFamily = useCallback(async (name: string, adminPassword: string): Promise<Family | null> => {
    try {
      const res = await apiFetch("/families/", {
        method: "POST",
        body: JSON.stringify({ name, admin_password: adminPassword }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create family");
      }
      const newFamily: Family = await res.json();
      setFamily(newFamily);
      setError(null);
      return newFamily;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, []);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  return {
    family,
    loading,
    error,
    refetch: fetchFamily,
    createFamily,
  };
}

