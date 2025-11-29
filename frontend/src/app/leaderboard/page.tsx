"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { format } from "date-fns";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function LeaderboardPageContent() {
  const { leaderboard, loading, error } = useLeaderboard();
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  const toggleUser = (userId: number) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="size-5" />
          <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading leaderboard...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="size-5" />
          <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="size-5" />
        <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No points yet. Complete chores to earn points!
            </div>
          ) : (
            leaderboard.map((entry, i) => {
              const isExpanded = expandedUsers.has(entry.user_id);
              return (
                <div
                  key={entry.user_id}
                  className="rounded-md border-2 border-border bg-card shadow-sm overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-3 hover:translate-x-1 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => toggleUser(entry.user_id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="size-8 rounded-full bg-secondary text-secondary-foreground border-2 border-border grid place-items-center font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.icon_emoji && (
                          <span className="text-xl">{entry.icon_emoji}</span>
                        )}
                        <div className="font-bold text-lg">{entry.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold bg-primary text-primary-foreground px-2 py-1 rounded border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {entry.total_points} pts
                      </div>
                      {entry.completed_chores.length > 0 && (
                        <button
                          className="p-1 hover:bg-secondary rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUser(entry.user_id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  {isExpanded && entry.completed_chores.length > 0 && (
                    <div className="border-t-2 border-border bg-muted/30">
                      <div className="p-4">
                        <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                          Completed Chores ({entry.completed_chores.length})
                        </h3>
                        <div className="space-y-2">
                          {entry.completed_chores.map((chore) => (
                            <div
                              key={chore.id}
                              className="flex items-center justify-between p-2 rounded-md bg-background border border-border"
                            >
                              <div className="flex items-center gap-2">
                                {chore.emoji && (
                                  <span className="text-lg">{chore.emoji}</span>
                                )}
                                <span className="font-medium">{chore.title}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>
                                  {format(new Date(chore.awarded_at), "MMM d, h:mm a")}
                                </span>
                                <span className="font-bold text-primary">
                                  +{chore.point_value} pts
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardPageContent />
    </ProtectedRoute>
  );
}