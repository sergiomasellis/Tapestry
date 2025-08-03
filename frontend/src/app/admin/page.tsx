"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CalendarPlus } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" /> Parental Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Manage roles and master admin password.
          </p>
          <Button variant="outline" asChild>
            <Link href="#">Set Master Password</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="size-5" /> Calendar Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="#">Connect Google</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="#">Add iCal</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#">Connect Alexa</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}