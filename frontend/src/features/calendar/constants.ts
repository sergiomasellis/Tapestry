// Time grid configuration
export const GRID_PX = 640; // must match CSS .timegrid height
export const START_HOUR = 8; // show from 8AM
export const END_HOUR = 20; // to 8PM
export const TOTAL_MIN = (END_HOUR - START_HOUR) * 60;

// Color classes for events
export const EVENT_COLORS = [
  "event-green",
  "event-purple", 
  "event-orange",
  "event-blue",
] as const;

export type EventColor = typeof EVENT_COLORS[number];
