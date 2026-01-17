"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { PendingUsersTable, PendingUser } from "@/components/admin/PendingUsersTable";
import { ApproveUserDialog } from "@/components/admin/ApproveUserDialog";
import { UserCheck } from "lucide-react";

export default function PendingUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; projectName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load pending users
  const loadPendingUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/users/pending");
      const data = await response.json();

      if (data.success) {
        setPendingUsers(data.data);
      } else {
        throw new Error(data.error || "Failed to load pending users");
      }
    } catch (error) {
      console.error("Failed to load pending users:", error);
      toast({
        title: "Error",
        description: "Failed to load pending users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load projects for assignment
  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();

      if (data.success) {
        setProjects(data.data.projects);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  useEffect(() => {
    loadPendingUsers();
    loadProjects();
  }, []);

  const handleApprove = (user: PendingUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleApprovalSubmit = async (userId: string, data: unknown) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "User approved successfully",
        });
        loadPendingUsers(); // Reload the list
        setIsDialogOpen(false);
      } else {
        throw new Error(result.error || "Failed to approve user");
      }
    } catch (error) {
      console.error("Failed to approve user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717] flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Pending User Approvals
          </h1>
          <p className="text-sm text-[#525252] mt-1">
            Review and approve new user registrations
          </p>
        </div>
      </div>

      {/* Pending Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 border border-[#E5E5E5] rounded-lg">
          <div className="text-[#525252]">Loading pending users...</div>
        </div>
      ) : (
        <PendingUsersTable users={pendingUsers} onApprove={handleApprove} />
      )}

      {/* Approval Dialog */}
      <ApproveUserDialog
        user={selectedUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleApprovalSubmit}
        projects={projects}
      />
    </div>
  );
}
