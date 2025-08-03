"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  return (
    <div className="max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Invite Family Member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Email" type="email" />
          <Button className="w-full">Send Invite</Button>
        </CardContent>
      </Card>
    </div>
  );
}