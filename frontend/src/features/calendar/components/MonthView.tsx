"use client";

import { format } from "date-fns";
import { EventItem, Chore } from "@/types";
import { dayKey, addDays } from "@/lib/date";
import { CheckCircle2 } from "lucide-react";
import { isChoreOnDay } from "@/lib/chore-utils";

type MonthGridCell = {
  date: Date;
  inCurrentMonth: boolean;
};

type MonthViewProps = {
  monthGrid: {
    firstOfMonth: Date;
    gridStart: Date;
    cells: MonthGridCell[];
  };
  events: EventItem[];
  chores?: Chore[];
  onEventClick: (event: EventItem) => void;
  onChoreClick?: (chore: Chore) => void;
};

export function MonthView({ monthGrid, events, chores = [], onEventClick, onChoreClick }: MonthViewProps) {
  // Get chores that are due on a specific day
  const getChoresForDay = (date: Date): Chore[] => {
    return chores.filter((chore) => isChoreOnDay(chore, date));
  };

  return (
    <div className="rounded-xl border bg-card/90 p-3 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">
          {format(monthGrid.firstOfMonth, "MMMM yyyy")}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {format(monthGrid.gridStart, "MMM d")} –{" "}
          {format(addDays(monthGrid.gridStart, 41), "MMM d")}
        </div>
      </div>

      {/* Month grid: 7 columns x 6 rows */}
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-xs font-medium text-muted-foreground px-2"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {monthGrid.cells.map((cell, idx) => {
          const isToday = dayKey(cell.date) === dayKey(new Date());
          const dayEvents = events.filter((e) => {
            const ds = new Date(cell.date);
            ds.setHours(0, 0, 0, 0);
            const de = new Date(cell.date);
            de.setHours(23, 59, 59, 999);
            return !(
              e.end.getTime() < ds.getTime() ||
              e.start.getTime() > de.getTime()
            );
          });
          const dayChores = getChoresForDay(cell.date);
          const totalItems = dayEvents.length + dayChores.length;

          return (
            <div
              key={idx}
              className={`rounded-lg border p-2 bg-muted/30 hover:bg-muted/50 transition relative min-h-[100px] ${
                !cell.inCurrentMonth ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`text-xs font-semibold ${
                    isToday ? "text-primary" : ""
                  }`}
                >
                  {format(cell.date, "d")}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {totalItems > 0 && `${totalItems}`}
                </div>
              </div>

              {/* Items - events and chores */}
              <div className="mt-2 space-y-1">
                {/* Chores first */}
                {dayChores.slice(0, 2).map((chore) => (
                  <div
                    key={`chore-${chore.id}`}
                    className={`truncate rounded-md px-2 py-1 text-xs cursor-pointer transition flex items-center gap-1 ${
                      chore.completed 
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 line-through opacity-60" 
                        : "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900"
                    }`}
                    title={`${chore.title} • ${chore.point_value} pts`}
                    onClick={() => onChoreClick?.(chore)}
                  >
                    {chore.completed && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                    <span className="mr-1">{chore.emoji || "📋"}</span>
                    <span className="truncate">{chore.title}</span>
                  </div>
                ))}
                
                {/* Events */}
                {dayEvents.slice(0, 3 - Math.min(dayChores.length, 2)).map((e, i) => (
                  <div
                    key={`${e.id}-${i}`}
                    className="truncate rounded-md px-2 py-1 text-xs bg-card shadow-sm border cursor-pointer hover:bg-accent transition"
                    title={`${e.title} • ${format(e.start, "p")}–${format(
                      e.end,
                      "p"
                    )}`}
                    onClick={() => onEventClick(e)}
                  >
                    <span className="mr-1">{e.emoji}</span>
                    {e.title}
                  </div>
                ))}
                
                {totalItems > 3 ? (
                  <div className="text-[10px] text-muted-foreground">
                    +{totalItems - 3} more
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
