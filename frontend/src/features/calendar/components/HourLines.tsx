"use client";

import { GRID_PX, START_HOUR, END_HOUR } from "../constants";

type HourLinesProps = {
  showCurrentTime?: boolean;
  nowTop?: number | null;
};

/**
 * Render hour lines for the time grid
 */
export function HourLines({ showCurrentTime = false, nowTop }: HourLinesProps) {
  const count = END_HOUR - START_HOUR + 1;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const top = (i / (count - 1)) * GRID_PX;
        return (
          <div
            key={`hourline-${i}`}
            className="pointer-events-none absolute left-0 right-0 border-t border-border/40"
            style={{ top }}
          />
        );
      })}
      {showCurrentTime && nowTop !== null && nowTop !== undefined && (
        <div
          className="current-time-line absolute left-0 right-0"
          style={{ top: nowTop }}
        />
      )}
    </>
  );
}

/**
 * Hour rail component showing time labels
 */
export function HourRail() {
  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i
  );

  return (
    <div className="timegrid-rail">
      {hours.map((h, i, arr) => {
        const top = (i / (arr.length - 1)) * GRID_PX;
        const h12 = ((h + 11) % 12) + 1;
        const mer = h < 12 ? "AM" : "PM";
        return (
          <div key={h} className="hour" style={{ top }}>
            {h12}
            {mer}
          </div>
        );
      })}
    </div>
  );
}
