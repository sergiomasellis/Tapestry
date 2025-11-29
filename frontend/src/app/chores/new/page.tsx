"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Types
import { ChoreCreate } from "@/types";

// Hooks
import { useChores } from "@/hooks/useChores";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useFamily } from "@/hooks/useFamily";

// Utilities
import { getWeekStart } from "@/lib/date";
import { format } from "date-fns";

// Common emojis for chores
const CHORE_EMOJIS = [
  "🧹", "🧺", "🍽️", "🐶", "🐱", "🌱", "🛏️", "📚",
  "🗑️", "🧽", "🚿", "🪥", "👕", "🧸", "🎮", "📝",
];

function NewChorePageContent() {
  const router = useRouter();
  const { family } = useFamily();

  // Family ID from user's family
  const FAMILY_ID = family?.id;

  // Chores management
  const { createChore } = useChores(FAMILY_ID);

  // Family members for assignment
  const { members: familyMembers } = useFamilyMembers(FAMILY_ID);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🧹");
  const [pointValue, setPointValue] = useState(5);
  const [assignedTo, setAssignedTo] = useState<string>("unassigned");
  const [weekStart, setWeekStart] = useState(() =>
    format(getWeekStart(new Date()), "yyyy-MM-dd")
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!FAMILY_ID) return; // Guard: ensure family_id exists

    setSaving(true);
    try {
      const newChore: ChoreCreate = {
        family_id: FAMILY_ID!, // Non-null assertion: we've checked above
        title: title.trim(),
        description: description.trim() || null,
        emoji,
        point_value: pointValue,
        assigned_to: assignedTo === "unassigned" ? null : parseInt(assignedTo),
        completed: false,
        week_start: weekStart,
      };
      await createChore(newChore);
      router.push("/dashboard#chores");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <Link
          href="/dashboard#chores"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Create New Chore</h1>
          <p className="text-muted-foreground">
            Add a new chore for your family. Assign points and optionally assign it to a family member.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title with Emoji */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <div className="flex gap-2">
              <Select value={emoji} onValueChange={setEmoji}>
                <SelectTrigger className="w-16">
                  <SelectValue>{emoji}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="grid grid-cols-4 gap-1 p-1">
                    {CHORE_EMOJIS.map((e) => (
                      <SelectItem
                        key={e}
                        value={e}
                        className="flex items-center justify-center p-2 text-lg cursor-pointer"
                      >
                        {e}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
              <Input
                id="title"
                placeholder="Clean room"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Input
              id="description"
              placeholder="Make bed and pick up toys"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Points */}
          <div className="space-y-2">
            <label htmlFor="points" className="text-sm font-medium">
              Point Value (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="points"
                min={1}
                max={10}
                value={pointValue}
                onChange={(e) => setPointValue(parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="w-12 text-center font-semibold text-lg bg-primary/10 rounded-md py-1">
                {pointValue}
              </div>
            </div>
          </div>

          {/* Assign To */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign To</label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select family member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {familyMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.icon_emoji && (
                      <span className="mr-2">{member.icon_emoji}</span>
                    )}
                    {member.name}
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({member.role})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Week Start */}
          <div className="space-y-2">
            <label htmlFor="weekStart" className="text-sm font-medium">
              Week Starting
            </label>
            <Input
              id="weekStart"
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/dashboard#chores">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving || !title.trim()}>
              <Save className="mr-2 size-4" />
              {saving ? "Creating..." : "Create Chore"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewChorePage() {
  return (
    <ProtectedRoute>
      <NewChorePageContent />
    </ProtectedRoute>
  );
}