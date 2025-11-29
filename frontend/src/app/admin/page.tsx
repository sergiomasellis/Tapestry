"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CalendarPlus, Users, Plus, Pencil, Trash2, AlertCircle, UserPlus } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useFamily } from "@/hooks/useFamily";
import { useFamilies, Family } from "@/hooks/useFamilies";
import { FamilyDialog } from "@/features/family/components/FamilyDialog";
import { AddMemberDialog } from "@/features/family/components/AddMemberDialog";
import { EditMemberDialog } from "@/features/family/components/EditMemberDialog";
import { useFamilyMembers, useCreateFamilyMember, useUpdateFamilyMember, useDeleteFamilyMember } from "@/hooks/useFamilyMembers";
import { useAuth } from "@/contexts/AuthContext";
import { FamilyMember } from "@/types";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function AdminPageContent() {
  const { user: currentUser } = useAuth();
  const { family, loading: familyLoading, refetch: refetchFamily } = useFamily();
  const { createFamily, updateFamily, deleteFamily } = useFamilies();
  const { members, loading: membersLoading, refetch: refetchMembers } = useFamilyMembers(family?.id);
  const { createMember, loading: creatingMember } = useCreateFamilyMember();
  const { updateMember, loading: updatingMember } = useUpdateFamilyMember();
  const { deleteMember, loading: deletingMember } = useDeleteFamilyMember();
  
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const handleCreateFamily = () => {
    setEditingFamily(null);
    setFamilyDialogOpen(true);
  };

  const handleEditFamily = (fam: Family) => {
    setEditingFamily(fam);
    setFamilyDialogOpen(true);
  };

  const handleDeleteFamily = async (fam: Family) => {
    const confirmed = confirm(
      `⚠️ WARNING: Are you sure you want to delete "${fam.name}"?\n\n` +
      `This will permanently delete:\n` +
      `- All family members\n` +
      `- All chores and points\n` +
      `- All events and calendar data\n` +
      `- All goals\n\n` +
      `This action CANNOT be undone!`
    );
    
    if (!confirmed) {
      return;
    }
    
    const success = await deleteFamily(fam.id);
    if (success) {
      refetchFamily();
      // Optionally redirect to home or show a message
      alert("Family deleted successfully. You may need to log out and create a new family.");
    } else {
      alert("Failed to delete family. Please try again.");
    }
  };

  const handleSaveFamily = async (data: { name: string; admin_password?: string }, familyId?: number) => {
    if (familyId) {
      await updateFamily(familyId, data);
    } else {
      await createFamily({ name: data.name, admin_password: data.admin_password || "" });
    }
    refetchFamily();
  };

  const handleAddMember = () => {
    if (!family) {
      alert("Please create a family first");
      return;
    }
    setAddMemberDialogOpen(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setEditMemberDialogOpen(true);
  };

  const handleDeleteMember = async (member: FamilyMember) => {
    if (member.id === currentUser?.id) {
      alert("You cannot delete yourself");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to remove "${member.name}" from the family?\n\n` +
      `This will permanently delete:\n` +
      `- Their account\n` +
      `- All their assigned chores\n` +
      `- All their points\n\n` +
      `This action CANNOT be undone!`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMember(member.id);
      refetchMembers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete member");
    }
  };

  const handleSaveMember = async (data: {
    name: string;
    email?: string;
    password?: string;
    role: "parent" | "child";
    family_id: number;
  }) => {
    try {
      await createMember(data);
      refetchMembers();
      setAddMemberDialogOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateMember = async (userId: number, data: {
    name?: string;
    profile_image_url?: string | null;
    icon_emoji?: string | null;
  }) => {
    try {
      await updateMember(userId, data);
      refetchMembers();
      setEditMemberDialogOpen(false);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Family Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" /> Family Management
            </CardTitle>
            <Button onClick={handleCreateFamily} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Family
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {familyLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : family ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{family.name}</h3>
                    <Badge variant="outline">Current Family</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(family.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditFamily(family)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFamily(family)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No family found. Create your first family to get started.
              </p>
              <Button onClick={handleCreateFamily}>
                <Plus className="mr-2 h-4 w-4" />
                Create Family
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Members Section */}
      {family && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-5" /> Family Members
              </CardTitle>
              <Button onClick={handleAddMember} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <p className="text-sm text-muted-foreground">Loading members...</p>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  No family members yet. Add your first member to get started.
                </p>
                <Button onClick={handleAddMember}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profile_image_url || undefined} alt={member.name} />
                        <AvatarFallback>
                          {member.icon_emoji || member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{member.name}</h3>
                          {member.id === currentUser?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                          <Badge
                            variant={member.role === "parent" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {member.role === "parent" ? "Parent" : "Child"}
                          </Badge>
                        </div>
                        {member.email && (
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Joined {format(new Date(member.created_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMember(member)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      {member.id !== currentUser?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMember(member)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingMember}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other Admin Sections */}
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

      {/* Family Dialog */}
      <FamilyDialog
        open={familyDialogOpen}
        onOpenChange={setFamilyDialogOpen}
        family={editingFamily}
        onSave={handleSaveFamily}
      />

      {/* Add Member Dialog */}
      {family && (
        <AddMemberDialog
          open={addMemberDialogOpen}
          onOpenChange={setAddMemberDialogOpen}
          familyId={family.id}
          onSave={handleSaveMember}
          loading={creatingMember}
        />
      )}

      {/* Edit Member Dialog */}
      <EditMemberDialog
        open={editMemberDialogOpen}
        onOpenChange={setEditMemberDialogOpen}
        member={editingMember}
        onSave={handleUpdateMember}
        loading={updatingMember}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminPageContent />
    </ProtectedRoute>
  );
}