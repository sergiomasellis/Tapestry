"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const mock = [
  { name: "Maggie", points: 17 },
  { name: "Max", points: 12 },
  { name: "Moma", points: 9 },
  { name: "Papa", points: 8 },
];

export default function LeaderboardPage() {
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
          {mock.map((m, i) => (
            <div
              key={m.name}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-full bg-secondary text-secondary-foreground grid place-items-center font-medium">
                  {i + 1}
                </div>
                <div className="font-medium">{m.name}</div>
              </div>
              <div className="text-sm text-muted-foreground">{m.points} pts</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}