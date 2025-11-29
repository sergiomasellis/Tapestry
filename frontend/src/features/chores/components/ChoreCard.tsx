"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Chore, ChoreItem, FamilyMember } from "@/types";
import { Check, MoreVertical, Pencil, Trash2, Undo } from "lucide-react";

// Legacy ChoreCard for demo data (backwards compatible)
type LegacyChoreCardProps = {
  chore: ChoreItem;
  colorClass: string;
};

export function LegacyChoreCard({ chore, colorClass }: LegacyChoreCardProps) {
  return (
    <Card className={`shadow-sm ${colorClass} bg-opacity-60`}>
      <CardHeader>
        <CardTitle className="text-base">
          <span className="mr-1">{chore.emoji}</span>
          {chore.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {chore.points} pts · {chore.assignedTo}
        </div>
        <div
          className={`text-xs ${
            chore.completed ? "text-green-700" : "text-muted-foreground"
          }`}
          role="status"
          aria-label={chore.completed ? "completed" : "pending"}
        >
          {chore.completed ? "Completed" : "Pending"}
        </div>
      </CardContent>
    </Card>
  );
}

// New ChoreCard for API data with actions
type ChoreCardProps = {
  chore: Chore;
  familyMembers: FamilyMember[];
  colorClass?: string;
  onEdit: (chore: Chore) => void;
  onDelete: (chore: Chore) => void;
  onToggleComplete: (chore: Chore) => void;
};

export function ChoreCard({
  chore,
  familyMembers,
  colorClass = "event-green",
  onEdit,
  onDelete,
  onToggleComplete,
}: ChoreCardProps) {
  const assignee = familyMembers.find((m) => m.id === chore.assigned_to);
  const assigneeName = assignee?.name || "Unassigned";
  const assigneeEmoji = assignee?.icon_emoji || "";

  return (
    <Card
      className={`shadow-sm ${colorClass} bg-opacity-60 transition-all hover:shadow-md ${
        chore.completed ? "opacity-75" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle
            className={`text-base flex items-center gap-1 ${
              chore.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            <span>{chore.emoji || "📋"}</span>
            {chore.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleComplete(chore)}>
                {chore.completed ? (
                  <>
                    <Undo className="mr-2 h-4 w-4" />
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Mark Complete
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(chore)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(chore)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {chore.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {chore.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {chore.point_value} pts
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {assigneeEmoji && <span>{assigneeEmoji}</span>}
              {assigneeName}
            </div>
          </div>
          <div
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              chore.completed
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
            role="status"
            aria-label={chore.completed ? "completed" : "pending"}
          >
            {chore.completed ? "Done" : "Pending"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
