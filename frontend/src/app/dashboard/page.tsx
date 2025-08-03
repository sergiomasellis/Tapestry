"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Trash2, Save } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type EventItem = {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  start: Date;
  end: Date;
  participants: string[];
};

type ChoreItem = {
  id: string;
  title: string;
  emoji: string;
  points: number;
  assignedTo: string;
  completed: boolean;
  start: Date;
  end: Date;
};

function getWeekStart(d = new Date()) {
  const day = d.getDay();
  const diff = d.getDate() - day;
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function DashboardPage() {
  const [anchor, setAnchor] = useState(getWeekStart(new Date()));
  const [view, setView] = useState<"week" | "day" | "month">("week"); // calendar view state

  // New Event dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDate, setDraftDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
  const [draftStart, setDraftStart] = useState<string>("09:00");
  const [draftEnd, setDraftEnd] = useState<string>("10:00");
  const [draftLocation, setDraftLocation] = useState<string>("");
  const [draftParticipants, setDraftParticipants] = useState<string>("");
  const weekStart = anchor;

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return { key: i, date, label: format(date, "EEE dd") };
    }),
    [weekStart]
  );

  // Month view helpers
  const monthStart = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekStart]);

  function getMonthGrid(startDate: Date) {
    const firstOfMonth = new Date(startDate);
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);

    const startDay = firstOfMonth.getDay(); // 0..6
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - startDay); // back to Sunday before/at 1st

    const cells = Array.from({ length: 42 }, (_, i) => {
      const d = addDays(gridStart, i);
      const inCurrentMonth = d.getMonth() === firstOfMonth.getMonth();
      return { date: d, inCurrentMonth };
    });

    return { firstOfMonth, gridStart, cells };
  }

  const monthGrid = useMemo(() => getMonthGrid(monthStart), [monthStart]);

  function nextMonth(d: Date) {
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + 1);
    return getWeekStart(nd); // keep anchor aligned to week start after month shift
  }
  function prevMonth(d: Date) {
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() - 1);
    return getWeekStart(nd);
  }

  const selectedDay = useMemo(() => {
    // default selected day is "today" if within the current anchor week, otherwise weekStart
    const today = new Date();
    const weekStartTs = new Date(weekStart).setHours(0, 0, 0, 0);
    const weekEndTs = new Date(addDays(weekStart, 6)).setHours(23, 59, 59, 999);
    const todayTs = today.getTime();
    const inThisWeek = todayTs >= weekStartTs && todayTs <= weekEndTs;
    return inThisWeek ? today : weekStart;
  }, [weekStart]);

  // Demo events with times so they can stretch by start/end
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const events: EventItem[] = useMemo(
    () => {
      // Use absolute dates (relative to today) so navigating weeks doesn't drag demo events along.
      const today = new Date();
      const thisWeekStart = getWeekStart(today);

      const makeAbsolute = (base: Date, dayOffset: number, sh: number, sm: number, eh: number, em: number) => {
        const s = addDays(base, dayOffset);
        s.setHours(sh, sm, 0, 0);
        const e = addDays(base, dayOffset);
        e.setHours(eh, em, 0, 0);
        return { start: s, end: e };
      };

      return [
        {
          id: "evt-1",
          title: "Soccer Practice",
          emoji: "⚽",
          description: "Bring water",
          ...makeAbsolute(thisWeekStart, 2, 15, 0, 16, 30),
          participants: ["Max"],
        },
        {
          id: "evt-2",
          title: "Dance Practice",
          emoji: "💃",
          description: "Bring shoes",
          ...makeAbsolute(thisWeekStart, 2, 17, 0, 18, 0),
          participants: ["Maggie"],
        },
        {
          id: "evt-3",
          title: "Summer Camp",
          emoji: "🌞",
          description: "Bring Food",
          // spans across two days in the current week
          start: (() => { const d = addDays(thisWeekStart, 1); d.setHours(9, 0, 0, 0); return d; })(),
          end:   (() => { const d = addDays(thisWeekStart, 2); d.setHours(12, 0, 0, 0); return d; })(),
          participants: ["Maggie", "Max"],
        },
        {
          id: "evt-4",
          title: "Dentist",
          emoji: "🦷",
          description: "Routine cleaning",
          ...makeAbsolute(thisWeekStart, 3, 10, 15, 11, 0),
          participants: ["Mom"],
        },
      ];
    },
    [] // static demo events anchored to the user's current week, not the anchor week
  );

  // merge demo events with user-created ones
  const mergedEvents = useMemo(() => {
    return [...eventList, ...events];
  }, [eventList, events]);

  // Currently selected event for editing (by id)
  const [editingId, setEditingId] = useState<string | null>(null);
  // Local edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editParticipants, setEditParticipants] = useState("");

  function openEditor(e: EventItem) {
    setEditingId(e.id);
    setEditTitle(e.title);

    // If an event spans multiple days, use the start day of the currently
    // rendered column when opening from week view so edits reflect that day’s slice.
    // Fallback to the event.start date when no column context is available.
    const currentColumnDate =
      // Try to read a data attribute we attach on the clicked element (set below)
      (typeof window !== "undefined" &&
        (document.activeElement as HTMLElement | null)?.dataset?.colDate) || null

    const baseDate = currentColumnDate ? new Date(currentColumnDate) : e.start;

    setEditDate(format(baseDate, "yyyy-MM-dd"));

    // Determine time range relative to the selected day slice:
    // - If editing on a middle day of a multi-day event, start at 00:00 and end at 23:59 for that day.
    // - If editing on the first/last day, clamp to the actual event boundaries.
    const startOfDay = new Date(baseDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(baseDate); endOfDay.setHours(23,59,59,999);

    const sliceStart = new Date(Math.max(e.start.getTime(), startOfDay.getTime()));
    const sliceEnd = new Date(Math.min(e.end.getTime(), endOfDay.getTime()));

    setEditStart(format(sliceStart, "HH:mm"));
    setEditEnd(format(sliceEnd, "HH:mm"));
    setEditLocation(e.description ?? "");
    setEditParticipants(e.participants.join(", "));
  }

  function saveEdit() {
    if (!editingId) return;
    const start = new Date(editDate + "T" + editStart);
    const end = new Date(editDate + "T" + editEnd);
    setEventList(prev =>
      prev.map(ev =>
        ev.id === editingId
          ? {
              ...ev,
              title: editTitle || "Untitled",
              description: editLocation || undefined,
              start,
              end,
              participants: editParticipants
                .split(",")
                .map(s => s.trim())
                .filter(Boolean),
            }
          : ev
      )
    );
    setEditingId(null);
  }

  function deleteEvent() {
    if (!editingId) return;
    setEventList(prev => prev.filter(e => e.id !== editingId));
    setEditingId(null);
  }

  const chores: ChoreItem[] = useMemo(
    () => [
      {
        id: "ch-1",
        title: "Clean Room",
        emoji: "🧹",
        points: 5,
        assignedTo: "Alex",
        completed: false,
        start: addDays(weekStart, 1),
        end: addDays(weekStart, 1),
      },
      {
        id: "ch-2",
        title: "Feed the Dog",
        emoji: "🐶",
        points: 2,
        assignedTo: "Sam",
        completed: true,
        start: addDays(weekStart, 0),
        end: addDays(weekStart, 0),
      },
    ],
    [weekStart]
  );

  // Time grid configuration
  const GRID_PX = 640; // must match CSS .timegrid height
  const START_HOUR = 8; // show from 8AM
  const END_HOUR = 20;  // to 8PM
  const TOTAL_MIN = (END_HOUR - START_HOUR) * 60;

  // create new event handler
  function addNewEvent() {
    const startDate = new Date(draftDate + "T" + draftStart);
    const endDate = new Date(draftDate + "T" + draftEnd);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;
    const id = "usr-" + Math.random().toString(36).slice(2, 8);
    const participants = draftParticipants
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setEventList((prev) => [
      ...prev,
      {
        id,
        title: draftTitle || "Untitled",
        emoji: "📌",
        description: draftLocation || undefined,
        start: startDate,
        end: endDate,
        participants,
      },
    ]);
    // reset draft
    setDraftTitle("");
    setDraftLocation("");
    setDraftParticipants("");
  }

  // client-only current time position for the thin mint line
  const [nowTop, setNowTop] = useState<number | null>(null);
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const mins = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
      const pct = Math.min(1, Math.max(0, mins / TOTAL_MIN));
      setNowTop(pct * GRID_PX);
    };
    calc();
    const id = setInterval(calc, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // helpers
  const minutesFromMidnight = (d: Date) => d.getHours() * 60 + d.getMinutes();
  const dayKey = (d: Date) => format(d, "yyyy-MM-dd");

  function eventBlockStyle(e: EventItem, dayDate: Date): React.CSSProperties {
    // clamp event to current day
    const dayStart = new Date(dayDate); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(dayDate); dayEnd.setHours(23,59,59,999);

    const start = new Date(Math.max(e.start.getTime(), dayStart.getTime()));
    const end = new Date(Math.min(e.end.getTime(), dayEnd.getTime()));

    // convert to grid window
    const startMin = Math.max(START_HOUR * 60, minutesFromMidnight(start));
    const endMin = Math.min(END_HOUR * 60, minutesFromMidnight(end));
    const clamped = Math.max(0, endMin - startMin);

    const topPct = (startMin - START_HOUR * 60) / TOTAL_MIN;
    const heightPct = clamped / TOTAL_MIN;

    return {
      top: `${topPct * GRID_PX}px`,
      height: `${Math.max(120, heightPct * GRID_PX)}px`, // enforce 100px minimum
    };
  }

  // UI helper to render the inline "New Event" panel
  function NewEventPanel() {
    return (
      <div className="rounded-xl border bg-card/90 p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold">Create Event</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm bg-white"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            {/* Constrain and allow the two time inputs to share space without overflowing */}
            <div className="flex w-full items-center gap-2 min-w-0">
              <div className="flex-1 min-w-0">
                <input
                  type="time"
                  className="w-full min-w-0 rounded-md border px-3 py-2 text-sm bg-white"
                  value={draftStart}
                  onChange={(e) => setDraftStart(e.target.value)}
                />
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">to</span>
              <div className="flex-1 min-w-0">
                <input
                  type="time"
                  className="w-full min-w-0 rounded-md border px-3 py-2 text-sm bg-white"
                  value={draftEnd}
                  onChange={(e) => setDraftEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm bg-white"
              placeholder="Title (e.g., Meet with Jonson Rider)"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm bg-white"
              placeholder="Location / Description"
              value={draftLocation}
              onChange={(e) => setDraftLocation(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm bg-white"
              placeholder="Participants (comma separated)"
              value={draftParticipants}
              onChange={(e) => setDraftParticipants(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            className="inline-flex items-center justify-center rounded-full bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary transition"
            onClick={addNewEvent}
          >
            Add Event
          </button>
          <button
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => setOpenDialog(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-5">
        {/* Top toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm hover:bg-accent transition"
              aria-label={
                view === "month" ? "Previous month" : view === "day" ? "Previous day" : "Previous week"
              }
              onClick={() => {
                if (view === "month") {
                  setAnchor(prevMonth(weekStart));
                } else if (view === "day") {
                  setAnchor(addDays(weekStart, -1));
                } else {
                  setAnchor(addDays(weekStart, -7));
                }
              }}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm hover:bg-accent transition"
              aria-label={
                view === "month" ? "Next month" : view === "day" ? "Next day" : "Next week"
              }
              onClick={() => {
                if (view === "month") {
                  setAnchor(nextMonth(weekStart));
                } else if (view === "day") {
                  setAnchor(addDays(weekStart, 1));
                } else {
                  setAnchor(addDays(weekStart, 7));
                }
              }}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
            <div className="text-lg font-semibold tracking-tight">
              {view === "month"
                ? `${format(monthGrid.firstOfMonth, "MMMM yyyy")}`
                : view === "day"
                  ? `${format(weekStart, "EEEE, MMM d, yyyy")}`
                  : `${format(weekStart, "dd MMMM")} – ${format(addDays(weekStart, 6), "dd MMM")}`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="rounded-full bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => setView("day")}
                className={`px-3 py-1.5 text-sm rounded-full transition ${view === "day" ? "bg-card shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                aria-pressed={view === "day"}
              >
                Day
              </button>
              <button
                type="button"
                onClick={() => setView("week")}
                className={`px-3 py-1.5 text-sm rounded-full transition ${view === "week" ? "bg-card shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                aria-pressed={view === "week"}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setView("month")}
                className={`px-3 py-1.5 text-sm rounded-full transition ${view === "month" ? "bg-card shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                aria-pressed={view === "month"}
              >
                Month
              </button>
            </div>
            {/* Dialog trigger */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm" aria-label="Add item">
                  <Plus className="size-4" aria-hidden="true" />
                  New
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Create Event</DialogTitle>
                  <DialogDescription>
                    Set the event details and click Add Event to place it on your calendar.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addNewEvent();
                    setOpenDialog(false);
                  }}
                >
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="title" className="text-sm font-medium">Title</label>
                      <Input
                        id="title"
                        placeholder="Meet with Jonson Rider"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="date" className="text-sm font-medium">Date</label>
                        <Input
                          id="date"
                          type="date"
                          value={draftDate}
                          onChange={(e) => setDraftDate(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <span className="text-sm font-medium">Time</span>
                        {/*
                          Prevent overflow and keep the native time picker icons fully visible.
                          Strategy:
                          - Use a min-w-0 row so flex children can shrink without clipping.
                          - Wrap each input in a relative group with explicit padding-right to reserve space for the icon (varies by browser).
                          - Add pr-8 and appearance-none on the input to avoid overlap and clipping.
                          - Keep "to" label from shrinking.
                        */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative flex-1 min-w-0">
                            <Input
                              type="time"
                              value={draftStart}
                              onChange={(e) => setDraftStart(e.target.value)}
                              className="w-full min-w-0 pr-8 appearance-none"
                            />
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">to</span>
                          <div className="relative flex-1 min-w-0">
                            <Input
                              type="time"
                              value={draftEnd}
                              onChange={(e) => setDraftEnd(e.target.value)}
                              className="w-full min-w-0 pr-8 appearance-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="location" className="text-sm font-medium">Location / Description</label>
                      <Input
                        id="location"
                        placeholder="Park Lane Office"
                        value={draftLocation}
                        onChange={(e) => setDraftLocation(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="participants" className="text-sm font-medium">Participants</label>
                      <Input
                        id="participants"
                        placeholder="Maggie, Max"
                        value={draftParticipants}
                        onChange={(e) => setDraftParticipants(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Add Event</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main board with rounded surface */}
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="size-5" aria-hidden="true" />
            <h1 className="text-xl font-semibold tracking-tight">
              {view === "day" ? "Daily Dashboard" : view === "week" ? "Weekly Dashboard" : "Monthly Dashboard"}
            </h1>
          </div>
          <Separator className="mb-4" />

          <Tabs defaultValue="events" className="w-full">
            <TabsList className="w-full max-w-xs rounded-full bg-muted/60 p-1">
              <TabsTrigger className="rounded-full" value="events">Events</TabsTrigger>
              <TabsTrigger className="rounded-full" value="chores">Chores</TabsTrigger>
            </TabsList>

            {/* Events - daily, weekly & monthly views */}
            <TabsContent value="events" className="mt-4">
              {view === "month" ? (
                /* MONTH VIEW */
                <div className="rounded-xl border bg-card/90 p-3 shadow-sm transition hover:shadow-md">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">{format(monthGrid.firstOfMonth, "MMMM yyyy")}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {format(monthGrid.gridStart, "MMM d")} – {format(addDays(monthGrid.gridStart, 41), "MMM d")}
                    </div>
                  </div>

                  {/* Month grid: 7 columns x 6 rows */}
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d)=>(
                      <div key={d} className="text-xs font-medium text-muted-foreground px-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {monthGrid.cells.map((cell, idx) => {
                      const isToday = dayKey(cell.date) === dayKey(new Date());
                      const dayEvents = mergedEvents.filter((e) => {
                        const ds = new Date(cell.date); ds.setHours(0,0,0,0);
                        const de = new Date(cell.date); de.setHours(23,59,59,999);
                        return !(e.end.getTime() < ds.getTime() || e.start.getTime() > de.getTime());
                      });

                      return (
                        <div
                          key={idx}
                          className={`rounded-lg border p-2 bg-muted/30 hover:bg-muted/50 transition relative ${!cell.inCurrentMonth ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`text-xs font-semibold ${isToday ? "text-primary" : ""}`}>
                              {format(cell.date, "d")}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{dayEvents.length} evts</div>
                          </div>

                          {/* Event pills */}
                          <div className="mt-2 space-y-1">
                            {dayEvents.slice(0, 3).map((e, i) => (
                              <div
                                key={`${e.id}-${i}`}
                                className="truncate rounded-md px-2 py-1 text-xs bg-card shadow-sm border"
                                title={`${e.title} • ${format(e.start, "p")}–${format(e.end, "p")}`}
                                onClick={() => openEditor(e)}
                              >
                                <span className="mr-1">{e.emoji}</span>
                                {e.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 ? (
                              <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : view === "week" ? (
                /* WEEK VIEW */
                <div className="rounded-xl border bg-card/90 p-3 shadow-sm transition hover:shadow-md">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">This Week</div>
                    <div className="text-[11px] text-muted-foreground">{format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d")}</div>
                  </div>

                  <div className="grid grid-cols-[56px_1fr] gap-2">
                    {/* Single shared hour rail */}
                    <div className="timegrid-rail">
                      {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((h, i, arr) => {
                        const top = (i / (arr.length - 1)) * GRID_PX;
                        const h12 = ((h + 11) % 12) + 1;
                        const mer = h < 12 ? "AM" : "PM";
                        return (
                          <div key={h} className="hour" style={{ top }}>
                            {h12}{mer}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: seven day columns sharing the same vertical timeline */}
                    <div className="relative">
                      {/* Underlay hour lines spanning across all days */}
                      <div className="timegrid-main">
                        {(() => {
                          const count = END_HOUR - START_HOUR + 1;
                          const arr = Array.from({ length: count });
                          return arr.map((_, i) => {
                            const top = (i / (count - 1)) * GRID_PX;
                            return <div key={i} className="hour-line" style={{ top }} />;
                          });
                        })()}
                      </div>

                      {/* Single overlayed current time line across the entire week grid */}
                      {nowTop !== null ? (
                        <div
                          className="current-time-line pointer-events-none"
                          style={{
                            top: nowTop,
                            position: "absolute",
                            left: 0,
                            right: 0,
                            zIndex: 20
                          }}
                        />
                      ) : null}

                      {/* Foreground: 7 columns, each with its own positioned events, but aligned to the shared grid */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
                        {days.map((d) => {
                          const isToday = dayKey(d.date) === dayKey(new Date());
                          return (
                            <div key={d.key} className="relative">
                              {/* Day header */}
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-sm font-semibold">{d.label}</div>
                                <div className="text-[11px] text-muted-foreground">0 tasks</div>
                              </div>

                              {/* Column track: same height as GRID_PX, events absolutely positioned within */}
                              <div className="relative rounded-lg bg-muted/40" style={{ height: GRID_PX }}>
                                {/* Remove per-column current time (we show a single line across the whole week above) */}
                                {null}

                                {mergedEvents
                                  .filter((e) => {
                                    const dayStartTs = new Date(d.date).setHours(0, 0, 0, 0);
                                    const dayEndTs = new Date(d.date).setHours(23, 59, 59, 999);
                                    const eStartTs = e.start.getTime();
                                    const eEndTs = e.end.getTime();
                                    return !(eEndTs < dayStartTs || eStartTs > dayEndTs);
                                  })
                                  .map((e, idx) => (
                                    <Popover
                                      key={`pop-${e.id}-${dayKey(d.date)}`}
                                      open={editingId === e.id}
                                      onOpenChange={(o) => (o ? openEditor(e) : setEditingId(null))}
                                    >
                                      <PopoverTrigger asChild>
                                        <div
                                          className={`timegrid-event cursor-pointer ${["event-green","event-purple","event-orange","event-blue"][idx % 4]}`}
                                          style={eventBlockStyle(e, d.date)}
                                          data-col-date={format(d.date, "yyyy-MM-dd")}
                                          onClick={() => openEditor(e)}
                                        >
                                          <div className="title-row">
                                        <div className="title">
                                          <span className="mr-1">{e.emoji}</span>
                                          {e.title}
                                        </div>
                                      </div>
                                      <div className="time">
                                        {format(e.start, "p")} – {format(e.end, "p")}
                                      </div>
                                      {e.description ? (
                                        <div className="desc">{e.description}</div>
                                      ) : null}
                                      <div className="mt-2 flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
                                        {e.participants.map((p, i) => {
                                          const avatarSrcMap: Record<string, string> = {
                                            "Maggie": "",
                                            "Max": "",
                                            "Mom": "",
                                            "Papa": "https://github.com/sergiomasellis.png",
                                            "Sam": "",
                                          };
                                          const src = avatarSrcMap[p]; // may be undefined
                                          const initials = p.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase() || "?";
                                          return (
                                            <Avatar key={`${p}-${i}`} className="size-6">
                                              <AvatarImage
                                                src={src}
                                                alt={p}
                                                onError={(e) => {
                                                  // Clear src to force Avatar to show the fallback
                                                  // @ts-ignore
                                                  e.currentTarget.src = "";
                                                }}
                                              />
                                              <AvatarFallback>{initials}</AvatarFallback>
                                            </Avatar>
                                          );
                                        })}
                                      </div>
                                    </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-80" align="start" sideOffset={8}>
                                        <div className="grid gap-3">
                                          <div className="space-y-1">
                                            <h4 className="text-sm font-medium leading-none">Edit Event</h4>
                                            <p className="text-xs text-muted-foreground">Update details and save.</p>
                                          </div>
                                          <div className="grid gap-2">
                                            <label className="text-sm font-medium">Title</label>
                                            <Input value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
                                          </div>
                                          <div className="grid sm:grid-cols-2 gap-3">
                                            <div className="grid gap-2">
                                              <label className="text-sm font-medium">Date</label>
                                              <Input type="date" value={editDate} onChange={(e)=>setEditDate(e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                              <span className="text-sm font-medium">Time</span>
                                              <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex-1 min-w-0">
                                                  <Input type="time" value={editStart} onChange={(e)=>setEditStart(e.target.value)} className="w-full min-w-0 pr-8 appearance-none" />
                                                </div>
                                                <span className="shrink-0 text-xs text-muted-foreground">to</span>
                                                <div className="flex-1 min-w-0">
                                                  <Input type="time" value={editEnd} onChange={(e)=>setEditEnd(e.target.value)} className="w-full min-w-0 pr-8 appearance-none" />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="grid gap-2">
                                            <label className="text-sm font-medium">Location / Description</label>
                                            <Input value={editLocation} onChange={(e)=>setEditLocation(e.target.value)} placeholder="Optional" />
                                          </div>
                                          <div className="grid gap-2">
                                            <label className="text-sm font-medium">Participants</label>
                                            <Input value={editParticipants} onChange={(e)=>setEditParticipants(e.target.value)} placeholder="Comma separated" />
                                          </div>
                                          <div className="flex items-center justify-between pt-1">
                                            <button
                                              type="button"
                                              onClick={deleteEvent}
                                              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                                              aria-label="Delete event"
                                            >
                                              <Trash2 className="size-4" /> Delete
                                            </button>
                                            <button
                                              type="button"
                                              onClick={saveEdit}
                                              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                                              aria-label="Save event"
                                            >
                                              <Save className="size-4" /> Save
                                            </button>
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* DAY VIEW */
                <div className="rounded-xl border bg-card/90 p-3 shadow-sm transition hover:shadow-md">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">{format(selectedDay, "EEEE dd")}</div>
                    <div className="text-[11px] text-muted-foreground">{format(selectedDay, "MMM d, yyyy")}</div>
                  </div>

                  <div className="grid grid-cols-[56px_1fr] gap-2">
                    {/* Single shared hour rail */}
                    <div className="timegrid-rail">
                      {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((h, i, arr) => {
                        const top = (i / (arr.length - 1)) * GRID_PX;
                        const h12 = ((h + 11) % 12) + 1;
                        const mer = h < 12 ? "AM" : "PM";
                        return (
                          <div key={h} className="hour" style={{ top }}>
                            {h12}{mer}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: single day column aligned to shared rail */}
                    <div className="relative">
                      {/* Underlay hour lines */}
                      <div className="timegrid-main">
                        {(() => {
                          const count = END_HOUR - START_HOUR + 1;
                          const arr = Array.from({ length: count });
                          return arr.map((_, i) => {
                            const top = (i / (count - 1)) * GRID_PX;
                            return <div key={i} className="hour-line" style={{ top }} />;
                          });
                        })()}
                        {/* Show current time only if the selected day is today */}
                        {nowTop !== null && dayKey(selectedDay) === dayKey(new Date()) ? (
                          <div className="current-time-line" style={{ top: nowTop }} />
                        ) : null}
                      </div>

                      {/* Column track */}
                      <div className="relative rounded-lg bg-muted/40" style={{ height: GRID_PX }}>
                        {/* Hour lines inside column to ensure visibility over column bg */}
                        {(() => {
                          const count = END_HOUR - START_HOUR + 1;
                          return Array.from({ length: count }).map((_, i) => {
                            const top = (i / (count - 1)) * GRID_PX;
                            return <div key={`col-hour-${i}`} className="hour-line" style={{ top }} />;
                          });
                        })()}
                        {/* Current time indicator within the column; only on today's date */}
                        {nowTop !== null && dayKey(selectedDay) === dayKey(new Date()) ? (
                          <div className="current-time-line" style={{ top: nowTop }} />
                        ) : null}

                        {mergedEvents
                          .filter((e) => {
                            const ds = new Date(selectedDay); ds.setHours(0,0,0,0);
                            const de = new Date(selectedDay); de.setHours(23,59,59,999);
                            return !(e.end.getTime() < ds.getTime() || e.start.getTime() > de.getTime());
                          })
                          .map((e, idx) => (
                            <div
                              key={`${e.id}-${idx}`}
                              className={`timegrid-event ${["event-green","event-purple","event-orange","event-blue"][idx % 4]}`}
                              style={eventBlockStyle(e, selectedDay)}
                            >
                              <div className="title-row">
                                <div className="title">
                                  <span className="mr-1">{e.emoji}</span>
                                  {e.title}
                                </div>
                              </div>
                              <div className="time">
                                {format(e.start, "p")} – {format(e.end, "p")}
                              </div>
                              {e.description ? (
                                <div className="desc">{e.description}</div>
                              ) : null}
                              <div className="chips">
                                {e.participants.map((p) => (
                                  <span key={p} className="chip">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Chores board as soft cards */}
            <TabsContent value="chores" className="mt-4" id="chores">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {chores.map((c, idx) => (
                  <Card key={c.id} className={`shadow-sm ${["event-green","event-purple","event-orange"][idx % 3]} bg-opacity-60`}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        <span className="mr-1">{c.emoji}</span>
                        {c.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {c.points} pts · {c.assignedTo}
                      </div>
                      <div
                        className={`text-xs ${c.completed ? "text-green-700" : "text-muted-foreground"}`}
                        role="status"
                        aria-label={c.completed ? "completed" : "pending"}
                      >
                        {c.completed ? "Completed" : "Pending"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}