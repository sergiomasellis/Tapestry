import { EventItem } from "@/types";
import { minutesFromMidnight } from "@/lib/date";
import { GRID_PX, START_HOUR, END_HOUR, TOTAL_MIN } from "../constants";

/**
 * Compute horizontal positions for overlapping events within a single day column
 */
export function layoutOverlaps(
  dayDate: Date,
  evts: EventItem[]
): Record<string, { left: string; width: string }> {
  // Clamp to single-day slices and compute intervals
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayDate);
  dayEnd.setHours(23, 59, 59, 999);

  const items = evts
    .map((e, idx) => {
      const start = new Date(Math.max(e.start.getTime(), dayStart.getTime()));
      const end = new Date(Math.min(e.end.getTime(), dayEnd.getTime()));
      const startMin = minutesFromMidnight(start);
      const endMin = Math.max(startMin + 1, minutesFromMidnight(end)); // avoid zero-length
      return { e, idx, startMin, endMin, group: -1, col: -1, colCount: 1 };
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  // Build overlap groups (connected components)
  let groupId = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].group !== -1) continue;
    items[i].group = groupId;
    let changed = true;
    while (changed) {
      changed = false;
      for (let j = 0; j < items.length; j++) {
        if (items[j].group === -1) {
          const overlaps = items.some(
            (k) =>
              k.group === groupId &&
              !(items[j].endMin <= k.startMin || items[j].startMin >= k.endMin)
          );
          if (overlaps) {
            items[j].group = groupId;
            changed = true;
          }
        }
      }
    }
    groupId++;
  }

  // Assign columns greedily per group
  const groups: Record<number, typeof items> = {};
  for (const it of items) {
    (groups[it.group] ||= []).push(it);
  }
  for (const g of Object.values(groups)) {
    g.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
    const active: { endMin: number; col: number }[] = [];
    for (const it of g) {
      // free finished columns
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].endMin <= it.startMin) active.splice(i, 1);
      }
      // smallest available col
      let c = 0;
      const used = new Set(active.map((a) => a.col));
      while (used.has(c)) c++;
      it.col = c;
      active.push({ endMin: it.endMin, col: c });
      // update colCount for this group
      const maxCol = Math.max(...g.map((x) => x.col));
      for (const x of g) x.colCount = Math.max(x.colCount, maxCol + 1);
    }
  }

  // Produce CSS positions
  const pos: Record<string, { left: string; width: string }> = {};
  for (const it of items) {
    const widthPct = 100 / Math.max(1, it.colCount);
    const leftPct = it.col * widthPct;
    pos[it.e.id] = {
      left: `${leftPct}%`,
      width: `calc(${widthPct}% - 6px)`,
    }; // include gutter
  }
  return pos;
}

/**
 * Calculate event block style (top/height) for the time grid
 */
export function eventBlockStyle(
  e: EventItem,
  dayDate: Date,
  dragState?: {
    id: string;
    startMinutes: number;
    durationMinutes: number;
  } | null
): React.CSSProperties {
  // clamp event to current day
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayDate);
  dayEnd.setHours(23, 59, 59, 999);

  let start = new Date(Math.max(e.start.getTime(), dayStart.getTime()));
  let end = new Date(Math.min(e.end.getTime(), dayEnd.getTime()));

  // Override with drag state if dragging this event
  if (dragState && dragState.id === e.id) {
    const h = Math.floor(dragState.startMinutes / 60);
    const m = Math.floor(dragState.startMinutes % 60);

    start = new Date(dayDate);
    start.setHours(h, m, 0, 0);
    end = new Date(start.getTime() + dragState.durationMinutes * 60000);
  }

  // convert to grid window
  const startMin = Math.max(START_HOUR * 60, minutesFromMidnight(start));
  const endMin = Math.min(END_HOUR * 60, minutesFromMidnight(end));
  const clamped = Math.max(0, endMin - startMin);

  const topPct = (startMin - START_HOUR * 60) / TOTAL_MIN;
  const heightPct = clamped / TOTAL_MIN;

  return {
    top: `${topPct * GRID_PX}px`,
    height: `${Math.max(20, heightPct * GRID_PX)}px`, // enforce 20px minimum
  };
}

/**
 * Snap minutes to a step (default 30 minutes)
 */
export function snapMinutes(min: number, step = 30): number {
  const snapped = Math.round(min / step) * step;
  return Math.max(START_HOUR * 60, Math.min(END_HOUR * 60, snapped));
}

/**
 * Calculate slot position from Y coordinate within grid
 */
export function calcSlot(date: Date, yWithinGridPx: number) {
  // Clamp Y strictly to the grid to avoid creating outside bounds
  const clampedY = Math.max(0, Math.min(GRID_PX - 1, yWithinGridPx));
  const pct = clampedY / GRID_PX;

  // Compute start minutes within visible window, snapped to 30-min increments
  let minutesFromStart = Math.round(pct * TOTAL_MIN);
  minutesFromStart = Math.max(0, Math.min(TOTAL_MIN - 30, minutesFromStart));

  const snappedMin = snapMinutes(START_HOUR * 60 + minutesFromStart, 30);

  // Derive start/end Date objects
  const hours = Math.floor(snappedMin / 60);
  const minutes = snappedMin % 60;

  const base = new Date(date);
  base.setHours(hours, minutes, 0, 0);

  const end = new Date(base);
  end.setMinutes(end.getMinutes() + 60);

  // Convert to pixel positions, fully clamped within the grid
  const startMinFromGrid = snappedMin - START_HOUR * 60;
  const topPx = Math.max(
    0,
    Math.min(GRID_PX - 1, (startMinFromGrid / TOTAL_MIN) * GRID_PX)
  );
  const heightPx = Math.min(
    GRID_PX - topPx,
    Math.max(40, (60 / TOTAL_MIN) * GRID_PX)
  );

  return { base, end, topPx, heightPx };
}

/**
 * Get events for a specific day
 */
export function getEventsForDay(events: EventItem[], date: Date): EventItem[] {
  const dayStartTs = new Date(date).setHours(0, 0, 0, 0);
  const dayEndTs = new Date(date).setHours(23, 59, 59, 999);
  return events.filter((e) => {
    const eStartTs = e.start.getTime();
    const eEndTs = e.end.getTime();
    return !(eEndTs < dayStartTs || eStartTs > dayEndTs);
  });
}
