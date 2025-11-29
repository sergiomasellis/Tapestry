"use client";

import { useState, useMemo, useCallback } from "react";
import { CalendarView } from "@/types";
import {
  getWeekStart,
  addDays,
  nextMonth,
  prevMonth,
  getMonthGrid,
} from "@/lib/date";

export function useCalendarNavigation() {
  const [anchor, setAnchor] = useState(() => getWeekStart(new Date()));
  const [view, setView] = useState<CalendarView>("week");

  const weekStart = anchor;

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        return { key: i, date };
      }),
    [weekStart]
  );

  const monthStart = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekStart]);

  const monthGrid = useMemo(() => getMonthGrid(monthStart), [monthStart]);

  const selectedDay = useMemo(() => {
    const today = new Date();
    const weekStartTs = new Date(weekStart).setHours(0, 0, 0, 0);
    const weekEndTs = new Date(addDays(weekStart, 6)).setHours(23, 59, 59, 999);
    const todayTs = today.getTime();
    const inThisWeek = todayTs >= weekStartTs && todayTs <= weekEndTs;
    return inThisWeek ? today : weekStart;
  }, [weekStart]);

  const goNext = useCallback(() => {
    if (view === "month") {
      setAnchor(nextMonth(weekStart));
    } else if (view === "day") {
      setAnchor(addDays(weekStart, 1));
    } else {
      setAnchor(addDays(weekStart, 7));
    }
  }, [view, weekStart]);

  const goPrev = useCallback(() => {
    if (view === "month") {
      setAnchor(prevMonth(weekStart));
    } else if (view === "day") {
      setAnchor(addDays(weekStart, -1));
    } else {
      setAnchor(addDays(weekStart, -7));
    }
  }, [view, weekStart]);

  return {
    anchor,
    view,
    setView,
    weekStart,
    days,
    monthStart,
    monthGrid,
    selectedDay,
    goNext,
    goPrev,
  };
}
