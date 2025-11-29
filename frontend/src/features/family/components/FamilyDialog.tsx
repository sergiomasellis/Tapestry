"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Family } from "@/hooks/useFamilies";
import { Users, Lock } from "lucide-react";

type FamilyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  family?: Family | null;
  onSave: (data: { name: string; admin_password?: string }, familyId?: number) => Promise<void>;
};

export function FamilyDialog({
  open,
  onOpenChange,
  family,
  onSave,
}: FamilyDialogProps) {
  const isEditing = !!family;

  const [name, setName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (family) {
        setName(family.name);
        setAdminPassword("");
        setConfirmPassword("");
      } else {
        setName("");
        setAdminPassword("");
        setConfirmPassword("");
      }
      setError(null);
    }
  }, [open, family]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Family name is required");
      return;
    }

    // For new families, password is required
    if (!isEditing && !adminPassword) {
      setError("Admin password is required");
      return;
    }

    // For editing, if password is provided, validate it
    if (isEditing && adminPassword) {
      if (adminPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (adminPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    // For new families, validate password
    if (!isEditing) {
      if (adminPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (adminPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setSaving(true);
    try {
      const data: { name: string; admin_password?: string } = { name: name.trim() };
      if (adminPassword) {
        data.admin_password = adminPassword;
      }
      await onSave(data, family?.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save family");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isEditing ? "Edit Family" : "Create New Family"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the family name and optionally change the admin password."
              : "Create a new family group. You'll need to set an admin password for family management."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Family Name */}
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Family Name
              </label>
              <Input
                id="name"
                placeholder="The Smith Family"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Admin Password */}
            <div className="grid gap-2">
              <label htmlFor="adminPassword" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {isEditing ? "New Admin Password (optional)" : "Admin Password"}
              </label>
              <Input
                id="adminPassword"
                type="password"
                placeholder={isEditing ? "Leave empty to keep current password" : "Enter admin password"}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required={!isEditing}
              />
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Only fill this if you want to change the admin password
                </p>
              )}
            </div>

            {/* Confirm Password (only if password is provided) */}
            {(adminPassword || !isEditing) && (
              <div className="grid gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm admin password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isEditing || !!adminPassword}
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Family"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

