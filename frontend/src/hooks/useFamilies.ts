"use client";

import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export type Family = {
  id: number;
  name: string;
  created_at: string;
};

export type FamilyCreate = {
  name: string;
  admin_password: string;
};

export type FamilyUpdate = {
  name?: string;
  admin_password?: string;
};

export function useFamilies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFamily = useCallback(async (data: FamilyCreate): Promise<Family | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/families/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create family");
      }
      const newFamily: Family = await res.json();
      return newFamily;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFamily = useCallback(async (familyId: number, data: FamilyUpdate): Promise<Family | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/families/${familyId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update family");
      }
      const updatedFamily: Family = await res.json();
      return updatedFamily;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFamily = useCallback(async (familyId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/families/${familyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete family");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createFamily,
    updateFamily,
    deleteFamily,
  };
}

