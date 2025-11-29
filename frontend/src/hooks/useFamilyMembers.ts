"use client";

import { useState, useEffect, useCallback } from "react";
import { FamilyMember } from "@/types";
import { apiFetch } from "@/lib/api";

export function useFamilyMembers(familyId?: number) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/users/");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: FamilyMember[] = await res.json();
      // Filter by family_id if provided
      const filtered = familyId
        ? data.filter((m) => m.family_id === familyId)
        : data;
      setMembers(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
  };
}

export function useCreateFamilyMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMember = useCallback(async (data: {
    name: string;
    email?: string;
    password?: string;
    role: "parent" | "child";
    family_id: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/users/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let errorMessage = "Failed to create member";
        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      const newMember: FamilyMember = await res.json();
      return newMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createMember,
    loading,
    error,
  };
}

export function useUpdateFamilyMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMember = useCallback(async (userId: number, data: {
    name?: string;
    profile_image_url?: string | null;
    icon_emoji?: string | null;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update member");
      }
      const updatedMember: FamilyMember = await res.json();
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateMember,
    loading,
    error,
  };
}

export function useDeleteFamilyMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMember = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to delete member");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteMember,
    loading,
    error,
  };
}
