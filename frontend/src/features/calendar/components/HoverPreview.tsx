"use client";

import { HoverPreview as HoverPreviewType } from "@/types";
import { dayKey } from "@/lib/date";

type HoverPreviewProps = {
  preview: HoverPreviewType;
  date: Date;
  isDragging: boolean;
};

/**
 * Hover preview ghost block for click-to-create
 */
export function HoverPreview({ preview, date, isDragging }: HoverPreviewProps) {
  if (!preview || isDragging || dayKey(preview.date) !== dayKey(date)) {
    return null;
  }

  return (
    <div
      className="absolute left-1 right-1 rounded-md border-2 border-dashed border-primary/60 bg-primary/10 flex items-center justify-center pointer-events-none"
      style={{ top: preview.topPx, height: preview.heightPx }}
    >
      <span className="text-primary/70 text-xl font-semibold select-none">
        +
      </span>
    </div>
  );
}
