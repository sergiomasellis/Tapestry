"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { EventItem } from "@/types";

export type EventEditorState = {
  editingId: string | null;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  participants: string[];
};

export function useEventEditor() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  const openEditor = useCallback((e: EventItem, sliceKey: string) => {
    setEditingId(sliceKey);
    setTitle(e.title);
    setStartDate(format(e.start, "yyyy-MM-dd"));
    setEndDate(format(e.end, "yyyy-MM-dd"));
    setStartTime(format(e.start, "HH:mm"));
    setEndTime(format(e.end, "HH:mm"));
    setLocation(e.description ?? "");
    setParticipants(e.participants);
  }, []);

  const closeEditor = useCallback(() => {
    setEditingId(null);
  }, []);

  const getUpdatedEvent = useCallback((): Partial<EventItem> | null => {
    if (!editingId) return null;

    const start = new Date(startDate + "T" + startTime);
    let end = new Date(endDate + "T" + endTime);

    if (end.getTime() < start.getTime()) {
      end = new Date(start.getTime() + 30 * 60 * 1000);
    }

    return {
      title: title || "Untitled",
      description: location || undefined,
      start,
      end,
      participants,
    };
  }, [editingId, title, startDate, endDate, startTime, endTime, location, participants]);

  const getEventIdFromSliceKey = useCallback((sliceKey: string): string => {
    return sliceKey.split("-")[0];
  }, []);

  return {
    editingId,
    setEditingId,
    title,
    setTitle,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    location,
    setLocation,
    participants,
    setParticipants,
    openEditor,
    closeEditor,
    getUpdatedEvent,
    getEventIdFromSliceKey,
  };
}
