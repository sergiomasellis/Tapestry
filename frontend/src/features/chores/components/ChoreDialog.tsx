"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Chore, ChoreCreate, ChoreUpdate, FamilyMember } from "@/types";
import { getWeekStart } from "@/lib/date";
import { format } from "date-fns";
import { Repeat, Star, Users, Calendar, ChevronDown, Sparkles, Check, Users2, User, ChevronLeft, ChevronRight } from "lucide-react";

// Common emojis for chores - grouped by category
const CHORE_EMOJI_GROUPS = [
  { label: "Cleaning", emojis: ["🧹", "🧺", "🧽", "🧴", "🚿", "🛁"] },
  { label: "Kitchen", emojis: ["🍽️", "🥣", "🍳", "🧊", "🗑️", "🫧"] },
  { label: "Pets", emojis: ["🐶", "🐱", "🐠", "🐹", "🦜", "🐰"] },
  { label: "Outdoors", emojis: ["🌱", "🌻", "🍂", "🚗", "🏠", "📬"] },
  { label: "Personal", emojis: ["🛏️", "👕", "🪥", "📚", "🎒", "💤"] },
  { label: "Other", emojis: ["📝", "✅", "🎮", "🧸", "🎨", "💪"] },
];

type ChoreDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chore?: Chore | null;
  familyMembers: FamilyMember[];
  familyId: number;
  onSave: (data: ChoreCreate | ChoreUpdate, choreId?: number) => Promise<void>;
};

export function ChoreDialog({
  open,
  onOpenChange,
  chore,
  familyMembers,
  familyId,
  onSave,
}: ChoreDialogProps) {
  const isEditing = !!chore;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🧹");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [pointValue, setPointValue] = useState(5);
  const [assignedToIds, setAssignedToIds] = useState<number[]>([]);
  const [weekStart, setWeekStart] = useState(() =>
    format(getWeekStart(new Date()), "yyyy-MM-dd")
  );
  const [saving, setSaving] = useState(false);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Group vs Individual chore
  const [isGroupChore, setIsGroupChore] = useState(true);
  
  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceCount, setRecurrenceCount] = useState(1);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceTimeOfDay, setRecurrenceTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "anytime">("anytime");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("");

  // Reset form and step when dialog opens or chore changes
  useEffect(() => {
    if (open) {
      setCurrentStep(1); // Reset to first step
      if (chore) {
        setTitle(chore.title);
        setDescription(chore.description || "");
        setEmoji(chore.emoji || "🧹");
        setPointValue(chore.point_value);
        // Parse assigned_to_ids (comma-separated) or fall back to single assigned_to
        if (chore.assigned_to_ids) {
          setAssignedToIds(chore.assigned_to_ids.split(",").map(Number).filter(Boolean));
        } else if (chore.assigned_to) {
          setAssignedToIds([chore.assigned_to]);
        } else {
          setAssignedToIds([]);
        }
        setIsGroupChore(chore.is_group_chore !== false); // Default to true
        setWeekStart(chore.week_start);
        setIsRecurring(chore.is_recurring || false);
        setRecurrenceType(chore.recurrence_type || "weekly");
        setRecurrenceInterval(chore.recurrence_interval || 1);
        setRecurrenceCount(chore.recurrence_count || 1);
        setRecurrenceDays(chore.recurrence_days ? chore.recurrence_days.split(",").map(Number) : []);
        setRecurrenceTimeOfDay(chore.recurrence_time_of_day || "anytime");
        setRecurrenceEndDate(chore.recurrence_end_date || "");
      } else {
        setTitle("");
        setDescription("");
        setEmoji("🧹");
        setPointValue(5);
        setAssignedToIds([]);
        setIsGroupChore(true);
        setWeekStart(format(getWeekStart(new Date()), "yyyy-MM-dd"));
        setIsRecurring(false);
        setRecurrenceType("weekly");
        setRecurrenceInterval(1);
        setRecurrenceCount(1);
        setRecurrenceDays([]);
        setRecurrenceTimeOfDay("anytime");
        setRecurrenceEndDate("");
      }
    }
  }, [open, chore]);

  const handleAssigneeToggle = (memberId: number) => {
    setAssignedToIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleDayToggle = (day: number) => {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validation for current step
    if (currentStep === 1 && !title.trim()) {
      return; // Can't proceed without title
    }
    if (currentStep === 3 && isRecurring && recurrenceType === "weekly" && recurrenceDays.length === 0) {
      alert("Please select at least one day of the week");
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit on the final step
    if (currentStep !== totalSteps) {
      return;
    }
    
    if (!title.trim()) return;

    if (isRecurring && recurrenceType === "weekly" && recurrenceDays.length === 0) {
      alert("Please select at least one day of the week");
      return;
    }

    setSaving(true);
    try {
      const recurringFields = isRecurring
        ? {
            is_recurring: true,
            recurrence_type: recurrenceType,
            recurrence_interval: recurrenceInterval,
            recurrence_count: recurrenceType === "daily" ? recurrenceCount : null,
            recurrence_days: recurrenceType === "weekly" ? recurrenceDays.join(",") : null,
            recurrence_time_of_day: recurrenceType === "daily" ? recurrenceTimeOfDay : null,
            recurrence_end_date: recurrenceEndDate || null,
          }
        : {
            is_recurring: false,
            recurrence_type: null,
            recurrence_interval: null,
            recurrence_count: null,
            recurrence_days: null,
            recurrence_time_of_day: null,
            recurrence_end_date: null,
          };

      // Build assigned_to_ids string (comma-separated)
      const assignedToIdsStr = assignedToIds.length > 0 ? assignedToIds.join(",") : null;
      // Keep legacy assigned_to for backwards compatibility (first assignee)
      const legacyAssignedTo = assignedToIds.length > 0 ? assignedToIds[0] : null;

      if (isEditing && chore) {
        const updates: ChoreUpdate = {
          title: title.trim(),
          description: description.trim() || null,
          emoji,
          point_value: pointValue,
          assigned_to: legacyAssignedTo,
          assigned_to_ids: assignedToIdsStr,
          is_group_chore: isGroupChore,
          ...recurringFields,
        };
        await onSave(updates, chore.id);
      } else {
        const newChore: ChoreCreate = {
          family_id: familyId,
          title: title.trim(),
          description: description.trim() || null,
          emoji,
          point_value: pointValue,
          assigned_to: legacyAssignedTo,
          assigned_to_ids: assignedToIdsStr,
          is_group_chore: isGroupChore,
          completed: false,
          week_start: weekStart,
          ...recurringFields,
        };
        await onSave(newChore);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const DAYS_OF_WEEK = [
    { value: 0, label: "S", full: "Sunday" },
    { value: 1, label: "M", full: "Monday" },
    { value: 2, label: "T", full: "Tuesday" },
    { value: 3, label: "W", full: "Wednesday" },
    { value: 4, label: "T", full: "Thursday" },
    { value: 5, label: "F", full: "Friday" },
    { value: 6, label: "S", full: "Saturday" },
  ];

  const getRecurrenceSummary = () => {
    if (!isRecurring) return null;
    
    if (recurrenceType === "daily") {
      const timeStr = recurrenceTimeOfDay !== "anytime" ? ` in the ${recurrenceTimeOfDay}` : "";
      return `${recurrenceCount}x daily${timeStr}`;
    }
    if (recurrenceType === "weekly") {
      const days = recurrenceDays.sort().map(d => DAYS_OF_WEEK[d].full.slice(0, 3)).join(", ");
      const interval = recurrenceInterval > 1 ? `every ${recurrenceInterval} weeks` : "weekly";
      return `${interval} on ${days || "..."}`;
    }
    if (recurrenceType === "monthly") {
      return recurrenceInterval > 1 ? `every ${recurrenceInterval} months` : "monthly";
    }
    return null;
  };

  const stepLabels = [
    "Basic Info",
    "Assignment",
    "Schedule"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header with solid color and border */}
        <div className="bg-primary p-6 text-primary-foreground border-b-2 border-border shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              {isEditing ? "Edit Chore" : "New Chore"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-primary-foreground/80 mt-1 text-sm font-medium">
            {isEditing ? "Update the chore details" : "Create a fun task for your family!"}
          </p>
          
          {/* Progress Steps */}
          <div className="mt-6 flex items-center justify-between">
            {stepLabels.map((label, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;
              
              return (
                <div key={stepNum} className="flex items-center flex-1 last:flex-none last:w-auto">
                  <div className="flex flex-col items-center z-10 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 border-border transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] ${
                        isActive
                          ? "bg-background text-foreground scale-110"
                          : isCompleted
                          ? "bg-foreground text-background"
                          : "bg-background/20 text-primary-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                    </div>
                    <span className={`text-xs mt-1.5 font-bold uppercase ${isActive ? "text-primary-foreground" : "text-primary-foreground/60"}`}>
                      {label}
                    </span>
                  </div>
                  {stepNum < totalSteps && (
                    <div
                      className={`h-0.5 flex-1 mx-2 border-t-2 border-dashed border-primary-foreground/50 min-w-[2rem]`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto p-1">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
            <div className="space-y-6">
              {/* Emoji + Title Row */}
              <div className="flex gap-3">
            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 w-14 text-3xl p-0 shrink-0 hover:scale-105 transition-transform border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow-color)]"
                >
                  {emoji}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="start">
                <div className="space-y-3">
                  {CHORE_EMOJI_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">{group.label}</p>
                      <div className="flex flex-wrap gap-1">
                        {group.emojis.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => {
                              setEmoji(e);
                              setEmojiPickerOpen(false);
                            }}
                            className={`w-9 h-9 text-xl rounded-lg hover:bg-muted transition-colors ${
                              emoji === e ? "bg-primary/20 ring-2 ring-primary" : ""
                            }`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="What's the chore?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-14 text-lg font-medium"
                required
              />
                </div>
              </div>

              {/* Description */}
              <Input
                placeholder="Add details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11"
              />

              {/* Points - Visual Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Points ({pointValue})
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPointValue(value)}
                      className={`w-8 h-8 rounded-full text-sm font-black border-2 border-border transition-all ${
                        value <= pointValue
                          ? "bg-amber-400 text-black scale-100 shadow-[2px_2px_0px_0px_var(--shadow-color)]"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 scale-90"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Assignment */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Assign To - Multi-select */}
              <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Assign to
              {assignedToIds.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({assignedToIds.length} selected)
                </span>
              )}
            </label>
            <p className="text-xs text-muted-foreground -mt-1">
              Select one or more family members
            </p>
            <div className="flex flex-wrap gap-2">
              {familyMembers.map((member) => {
                const isSelected = assignedToIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleAssigneeToggle(member.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--shadow-color)] ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-border shadow-[3px_3px_0px_0px_var(--shadow-color)]"
                        : "bg-background border-border hover:bg-accent"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                    {member.icon_emoji && <span>{member.icon_emoji}</span>}
                    {member.name}
                  </button>
                );
              })}
            </div>
                {assignedToIds.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    💡 No one selected — anyone can complete this chore
                  </p>
                )}
              </div>

              {/* Group vs Individual toggle - only show when multiple people assigned */}
              {assignedToIds.length > 1 && (
                <div className="rounded-xl border-2 overflow-hidden">
                  <div className="p-3 space-y-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-violet-500" />
                      Completion type
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsGroupChore(true)}
                        className={`p-3 rounded-lg text-left transition-all border-2 ${
                          isGroupChore
                            ? "bg-violet-50 dark:bg-violet-950 border-violet-500"
                            : "border-muted hover:border-violet-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4" />
                          <span className="font-medium text-sm">Group</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          One person completes it for everyone
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsGroupChore(false)}
                        className={`p-3 rounded-lg text-left transition-all border-2 ${
                          !isGroupChore
                            ? "bg-violet-50 dark:bg-violet-950 border-violet-500"
                            : "border-muted hover:border-violet-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium text-sm">Individual</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Each person completes their own
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

            {/* Step 3: Schedule */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Due Date */}
                {!isEditing && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      Due this week starting
                    </label>
                    <Input
                      type="date"
                      value={weekStart}
                      onChange={(e) => setWeekStart(e.target.value)}
                      className="h-11"
                    />
                  </div>
                )}

                {/* Recurring Toggle */}
                <div className="rounded-xl border-2 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                      isRecurring ? "bg-purple-50 dark:bg-purple-950" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isRecurring ? "bg-purple-100 dark:bg-purple-900" : "bg-muted"}`}>
                        <Repeat className={`h-4 w-4 ${isRecurring ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Recurring chore</p>
                        <p className="text-sm text-muted-foreground">
                          {isRecurring ? getRecurrenceSummary() : "Repeats on a schedule"}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isRecurring ? "rotate-180" : ""}`} />
                  </button>

                  {/* Recurring Options */}
                  {isRecurring && (
                    <div className="p-4 border-t-2 space-y-4 bg-muted/30">
                    {/* Frequency Type */}
                    <div className="flex gap-2">
                      {(["daily", "weekly", "monthly"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setRecurrenceType(type)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                            recurrenceType === type
                              ? "bg-purple-600 text-white"
                              : "bg-background border-2 hover:border-purple-300"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {/* Daily Options */}
                    {recurrenceType === "daily" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">How many times per day?</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((count) => (
                              <button
                                key={count}
                                type="button"
                                onClick={() => setRecurrenceCount(count)}
                                className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
                                  recurrenceCount === count
                                    ? "bg-purple-600 text-white"
                                    : "bg-background border-2 hover:border-purple-300"
                                }`}
                              >
                                {count}x
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">When?</label>
                          <Select value={recurrenceTimeOfDay} onValueChange={(v) => setRecurrenceTimeOfDay(v as typeof recurrenceTimeOfDay)}>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">🌅 Morning</SelectItem>
                              <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                              <SelectItem value="evening">🌙 Evening</SelectItem>
                              <SelectItem value="anytime">⏰ Any time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Weekly Options */}
                    {recurrenceType === "weekly" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Which days?</label>
                          <div className="flex gap-1.5">
                            {DAYS_OF_WEEK.map((day) => (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => handleDayToggle(day.value)}
                                title={day.full}
                                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                  recurrenceDays.includes(day.value)
                                    ? "bg-purple-600 text-white"
                                    : "bg-background border-2 hover:border-purple-300"
                                }`}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Repeat every</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4].map((interval) => (
                              <button
                                key={interval}
                                type="button"
                                onClick={() => setRecurrenceInterval(interval)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                  recurrenceInterval === interval
                                    ? "bg-purple-600 text-white"
                                    : "bg-background border-2 hover:border-purple-300"
                                }`}
                              >
                                {interval} week{interval > 1 ? "s" : ""}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Monthly Options */}
                    {recurrenceType === "monthly" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Repeat every</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 6].map((interval) => (
                            <button
                              key={interval}
                              type="button"
                              onClick={() => setRecurrenceInterval(interval)}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                recurrenceInterval === interval
                                  ? "bg-purple-600 text-white"
                                  : "bg-background border-2 hover:border-purple-300"
                              }`}
                            >
                              {interval} mo{interval > 1 ? "s" : ""}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* End Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        End date (optional)
                      </label>
                      <Input
                        type="date"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Actions */}
          <div className="flex gap-3 pt-4 border-t shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12"
            >
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="h-12"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
              {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !title.trim()}
                className="flex-1 h-12 border-2 border-border bg-primary text-primary-foreground font-bold uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:bg-primary/90"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={saving || !title.trim()}
                className="flex-1 h-12 border-2 border-border bg-primary text-primary-foreground font-bold uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:bg-primary/90"
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Chore"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
