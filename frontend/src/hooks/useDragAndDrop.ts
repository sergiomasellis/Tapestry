"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DragState } from "@/types";
import { GRID_PX, TOTAL_MIN, START_HOUR, END_HOUR } from "@/features/calendar/constants";

// Extended drag state that includes the original start time
type InternalDragState = NonNullable<DragState> & {
  originalStartMinutes: number;
};

type UseDragAndDropOptions = {
  onDragEnd: (dragState: NonNullable<DragState>) => void;
};

export function useDragAndDrop({ onDragEnd }: UseDragAndDropOptions) {
  const [dragState, setDragState] = useState<InternalDragState | null>(null);
  
  // Use refs to avoid re-running useEffect on every state change
  const dragStateRef = useRef<InternalDragState | null>(null);
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;
  
  // Track if we actually moved during drag (to distinguish from clicks)
  const hasDraggedRef = useRef(false);
  // Track the last drag end time to prevent click from firing
  const lastDragEndRef = useRef(0);
  // Track if we're currently processing a drag end to prevent duplicates
  const processingDragEndRef = useRef(false);

  // Keep dragStateRef in sync with state
  dragStateRef.current = dragState;

  // Global drag handlers - only attach/detach when dragging starts/stops
  useEffect(() => {
    // Only set up listeners when dragging is active
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentDrag = dragStateRef.current;
      if (!currentDrag) return;
      
      // Mark that we've actually dragged (moved the mouse)
      if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
        hasDraggedRef.current = true;
      }

      const minPerPx = TOTAL_MIN / GRID_PX;
      const deltaX = e.clientX - currentDrag.initialClientX;
      const deltaY = e.clientY - currentDrag.initialClientY;
      const dayOffset = Math.round(deltaX / currentDrag.columnWidth);
      
      // Calculate new start time based on TOTAL delta from ORIGINAL position
      const rawNewStart = currentDrag.originalStartMinutes + deltaY * minPerPx;
      
      // Clamp to visible grid range (START_HOUR to END_HOUR minus duration)
      const minStart = START_HOUR * 60;
      const maxStart = END_HOUR * 60 - currentDrag.durationMinutes;
      const newStart = Math.max(minStart, Math.min(maxStart, rawNewStart));

      // Only update if values changed significantly (reduce re-renders)
      if (Math.abs(newStart - currentDrag.startMinutes) > 0.5 || dayOffset !== currentDrag.dayOffset) {
        const newState = {
          ...currentDrag,
          startMinutes: newStart,
          dayOffset: dayOffset,
        };
        // Update ref immediately so mouseup gets the latest value
        dragStateRef.current = newState;
        setDragState(newState);
      }
    };

    const handleMouseUp = () => {
      // Prevent duplicate calls
      if (processingDragEndRef.current) {
        console.log("⚠️ Duplicate handleMouseUp call prevented");
        return;
      }
      
      // Use setState callback to ensure we get the LATEST state value
      // This avoids race conditions where mouseup fires before React re-renders
      setDragState((currentDrag) => {
        if (currentDrag && hasDraggedRef.current && !processingDragEndRef.current) {
          processingDragEndRef.current = true;
          // Pass the drag state without the internal originalStartMinutes field
          const { originalStartMinutes, ...publicDragState } = currentDrag;
          console.log("🖱️ Calling onDragEnd for:", publicDragState.id);
          onDragEndRef.current(publicDragState);
          lastDragEndRef.current = Date.now();
          
          // Reset processing flag after a short delay
          setTimeout(() => {
            processingDragEndRef.current = false;
            hasDraggedRef.current = false;
          }, 100);
        }
        return null; // Clear the drag state
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!dragState]); // Only re-run when dragging starts/stops (boolean change)

  const startDrag = useCallback(
    (
      id: string,
      startMinutes: number,
      durationMinutes: number,
      clientX: number,
      clientY: number,
      columnWidth: number
    ) => {
      hasDraggedRef.current = false;
      setDragState({
        id,
        startMinutes,
        originalStartMinutes: startMinutes, // Store the original for calculations
        durationMinutes,
        dayOffset: 0,
        initialClientX: clientX,
        initialClientY: clientY,
        columnWidth,
      });
    },
    []
  );

  // Check if we just finished dragging (to prevent click handlers from firing)
  const wasJustDragging = useCallback(() => {
    return Date.now() - lastDragEndRef.current < 200;
  }, []);

  // Return the drag state directly - no memoization needed since we control updates
  const publicDragState: DragState = dragState ? {
    id: dragState.id,
    startMinutes: dragState.startMinutes,
    durationMinutes: dragState.durationMinutes,
    dayOffset: dragState.dayOffset,
    initialClientX: dragState.initialClientX,
    initialClientY: dragState.initialClientY,
    columnWidth: dragState.columnWidth,
  } : null;

  return {
    dragState: publicDragState,
    startDrag,
    isDragging: dragState !== null,
    wasJustDragging,
  };
}
