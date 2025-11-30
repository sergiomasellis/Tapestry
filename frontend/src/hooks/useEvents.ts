"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { EventItem, DragState, Event, EventCreate, EventUpdate } from "@/types";
import { addDays } from "@/lib/date";
import { apiFetch } from "@/lib/api";

// Convert backend Event to frontend EventItem
function eventToEventItem(event: Event): EventItem {
  // Backend returns timezone-naive UTC datetimes (stored in SQLite)
  // We need to treat them as UTC by appending 'Z' if not already present
  const parseUTCDate = (dateStr: string): Date => {
    // If the string doesn't end with 'Z' or timezone offset, treat it as UTC
    if (!dateStr.endsWith('Z') && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
      return new Date(dateStr + 'Z');
    }
    return new Date(dateStr);
  };
  
  return {
    id: `evt-${event.id}`,
    title: event.title,
    emoji: event.emoji || "📌",
    description: event.description || undefined,
    start: parseUTCDate(event.start_time),
    end: parseUTCDate(event.end_time),
    participants: [], // TODO: Fetch participants separately if needed
  };
}

// Convert frontend EventItem to backend EventCreate
function eventItemToEventCreate(
  event: Omit<EventItem, "id">,
  familyId: number
): EventCreate {
  return {
    family_id: familyId,
    title: event.title,
    emoji: event.emoji || null,
    description: event.description || null,
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString(),
    source: "manual",
    source_id: null,
  };
}

export function useEvents(
  dragState: DragState,
  familyId?: number,
  weekStart?: Date
) {
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track current eventList for stable callbacks
  const eventListRef = useRef(eventList);
  eventListRef.current = eventList;
  
  // Ref to prevent duplicate commitDrag calls
  const committingDragRef = useRef<string | null>(null);

  // Fetch events from backend
  const fetchEvents = useCallback(async () => {
    if (!familyId || !weekStart) {
      setEventList([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const params = new URLSearchParams({
        family_id: familyId.toString(),
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
      });

      const res = await apiFetch(`/calendars/?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }
      const data: Event[] = await res.json();
      const converted = data.map(eventToEventItem);
      setEventList(converted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [familyId, weekStart]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Merged events with drag state applied for real-time preview
  // Use individual dragState values as dependencies to prevent unnecessary recalculations
  const mergedEvents = useMemo(() => {
    if (!dragState) return eventList;

    return eventList.map((ev) => {
      if (ev.id === dragState.id) {
        // Get the original event's date in local time (year, month, day only)
        const originalDate = new Date(ev.start);
        const targetDate = new Date(
          originalDate.getFullYear(),
          originalDate.getMonth(),
          originalDate.getDate()
        );
        
        // Add day offset to get the target day
        const finalTargetDate = addDays(targetDate, dragState.dayOffset);
        
        // Set the time on the target date (in local time)
        const h = Math.floor(dragState.startMinutes / 60);
        const m = Math.floor(dragState.startMinutes % 60);
        finalTargetDate.setHours(h, m, 0, 0);
        
        const finalStart = finalTargetDate;
        const finalEnd = new Date(finalStart.getTime() + dragState.durationMinutes * 60000);

        return { ...ev, start: finalStart, end: finalEnd };
      }
      return ev;
    });
  }, [
    eventList,
    dragState?.id,
    dragState?.startMinutes,
    dragState?.durationMinutes,
    dragState?.dayOffset,
  ]);

  const addEvent = useCallback(
    async (event: Omit<EventItem, "id">): Promise<EventItem | null> => {
      if (!familyId) {
        setError("Family ID is required to create events");
        return null;
      }

      try {
        const eventCreate = eventItemToEventCreate(event, familyId);
        const res = await apiFetch("/calendars/", {
          method: "POST",
          body: JSON.stringify(eventCreate),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to create event");
        }
        const newEvent: Event = await res.json();
        const eventItem = eventToEventItem(newEvent);
        setEventList((prev) => [...prev, eventItem]);
        return eventItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [familyId]
  );

  const updateEvent = useCallback(
    async (
      id: string,
      updates: Partial<Omit<EventItem, "id">>
    ): Promise<EventItem | null> => {
      // Extract numeric ID from string ID (format: "evt-123")
      const numericId = parseInt(id.replace("evt-", ""), 10);
      if (isNaN(numericId)) {
        setError("Invalid event ID");
        return null;
      }

      try {
        const eventUpdate: EventUpdate = {};
        if (updates.title !== undefined) eventUpdate.title = updates.title;
        if (updates.description !== undefined)
          eventUpdate.description = updates.description || null;
        if (updates.emoji !== undefined) eventUpdate.emoji = updates.emoji || null;
        if (updates.start !== undefined)
          eventUpdate.start_time = updates.start.toISOString();
        if (updates.end !== undefined)
          eventUpdate.end_time = updates.end.toISOString();

        const res = await apiFetch(`/calendars/${numericId}`, {
          method: "PUT",
          body: JSON.stringify(eventUpdate),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to update event");
        }
        const updated: Event = await res.json();
        const eventItem = eventToEventItem(updated);
        setEventList((prev) =>
          prev.map((ev) => (ev.id === id ? eventItem : ev))
        );
        return eventItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    []
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      // Extract numeric ID from string ID (format: "evt-123")
      const numericId = parseInt(id.replace("evt-", ""), 10);
      if (isNaN(numericId)) {
        setError("Invalid event ID");
        return false;
      }

      try {
        const res = await apiFetch(`/calendars/${numericId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete event");
        setEventList((prev) => prev.filter((e) => e.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    []
  );

  const commitDrag = useCallback(
    async (drag: NonNullable<DragState>) => {
      // Prevent duplicate calls for the same drag operation
      if (committingDragRef.current === drag.id) {
        console.log("⚠️ Duplicate commitDrag call prevented for:", drag.id);
        return;
      }
      committingDragRef.current = drag.id;
      
      try {
        // Find the event being dragged (use ref for stable callback)
        const event = eventListRef.current.find((ev) => ev.id === drag.id);
        if (!event) {
          committingDragRef.current = null;
          return;
        }

        // Calculate new times
        // Get the original event's date in local time (year, month, day only)
        const originalDate = new Date(event.start);
        const targetDate = new Date(
          originalDate.getFullYear(),
          originalDate.getMonth(),
          originalDate.getDate()
        );
        
        // Add day offset to get the target day
        const finalTargetDate = addDays(targetDate, drag.dayOffset);
        
        // Set the time on the target date (in local time)
        const snappedStartMin = Math.round(drag.startMinutes / 15) * 15;
        const h = Math.floor(snappedStartMin / 60);
        const m = snappedStartMin % 60;
        finalTargetDate.setHours(h, m, 0, 0);
        
        const finalStart = finalTargetDate;
        const finalEnd = new Date(finalStart.getTime() + drag.durationMinutes * 60000);

        // Log for debugging
        console.log("📅 Event Drop - Date Calculation:", {
          originalStart: event.start.toISOString(),
          originalStartLocal: event.start.toString(),
          targetDate: finalTargetDate.toISOString(),
          targetDateLocal: finalTargetDate.toString(),
          finalStart: finalStart.toISOString(),
          finalStartLocal: finalStart.toString(),
          hours: h,
          minutes: m,
          dayOffset: drag.dayOffset,
          startMinutes: drag.startMinutes,
          snappedStartMin,
        });

        // Optimistically update the event list immediately (before API call)
        // This prevents the event from snapping back to its original position
        setEventList((prev) =>
          prev.map((ev) =>
            ev.id === drag.id
              ? { ...ev, start: finalStart, end: finalEnd }
              : ev
          )
        );

        // Update the event via API (this will also update the list again with server response)
        await updateEvent(drag.id, {
          start: finalStart,
          end: finalEnd,
        });
      } finally {
        // Clear the committing flag after a short delay to allow for any race conditions
        setTimeout(() => {
          committingDragRef.current = null;
        }, 100);
      }
    },
    [updateEvent]
  );

  return {
    eventList,
    mergedEvents,
    loading,
    error,
    setEventList,
    addEvent,
    updateEvent,
    deleteEvent,
    commitDrag,
    refetch: fetchEvents,
  };
}
