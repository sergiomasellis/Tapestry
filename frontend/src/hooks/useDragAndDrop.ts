"use client";

import { useState, useEffect, useCallback } from "react";
import { DragState } from "@/types";
import { GRID_PX, TOTAL_MIN } from "@/features/calendar/constants";

type UseDragAndDropOptions = {
  onDragEnd: (dragState: NonNullable<DragState>) => void;
};

export function useDragAndDrop({ onDragEnd }: UseDragAndDropOptions) {
  const [dragState, setDragState] = useState<DragState>(null);

  // Global drag handlers
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const minPerPx = TOTAL_MIN / GRID_PX;
      const deltaX = e.clientX - dragState.initialClientX;
      const dayOffset = Math.round(deltaX / dragState.columnWidth);

      setDragState((prev) => {
        if (!prev) return null;
        const newStart = prev.startMinutes + e.movementY * minPerPx;

        return {
          ...prev,
          startMinutes: newStart,
          dayOffset: dayOffset,
        };
      });
    };

    const handleMouseUp = () => {
      if (dragState) {
        onDragEnd(dragState);
        setDragState(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, onDragEnd]);

  const startDrag = useCallback(
    (
      id: string,
      startMinutes: number,
      durationMinutes: number,
      clientX: number,
      clientY: number,
      columnWidth: number
    ) => {
      setDragState({
        id,
        startMinutes,
        durationMinutes,
        dayOffset: 0,
        initialClientX: clientX,
        initialClientY: clientY,
        columnWidth,
      });
    },
    []
  );

  return {
    dragState,
    startDrag,
    isDragging: dragState !== null,
  };
}
