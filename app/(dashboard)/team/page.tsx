"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamGrid } from "@/components/team/team-grid";
import { useTeam, TeamMember } from "@/hooks/use-team";
import { DEPARTMENT_LABELS, STATUS_LABELS } from "@/lib/validations/team";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { useRole } from "@/lib/hooks/use-role";

export default function TeamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { role } = useRole();
  const isAdmin = role === "ADMIN";
  const {
    fetchTeamMembers,
    deleteTeamMember,
    isLoading,
  } = useTeam();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Delete confirmation (only for admin)
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);

  // Load team members
  const loadTeamMembers = async () => {
    try {
      const filters: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "desc" | "asc";
        search?: string;
        status?: string;
        department?: string;
      } = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "createdAt",
        sortOrder: "desc" as const,
      };

      if (search) filters.search = search;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (departmentFilter !== "all") filters.department = departmentFilter;

      const data = await fetchTeamMembers(filters);
      setTeamMembers(data.teamMembers);
      setPagination(data.pagination);
    } catch (error) {
      logger.error("Failed to load team members", error, { action: "fetch_team_members" });
      toast({
        title: "Error",
        description: "Failed to load team members. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load team members when filters change
  useEffect(() => {
    loadTeamMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, departmentFilter]);

  // Load team members when page changes
  useEffect(() => {
    loadTeamMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  // Handlers
  const handleView = (member: TeamMember) => {
    router.push(`/team/${member.id}`);
  };

  const handleDelete = (member: TeamMember) => {
    if (isAdmin) {
      setDeletingMember(member);
    }
  };

  const confirmDelete = async () => {
    if (!deletingMember) return;

    try {
      await deleteTeamMember(deletingMember.id);
      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
      setDeletingMember(null);
      loadTeamMembers();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error instanceof Error ? error.message : null) || "Failed to delete team member",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Team</h1>
          <p className="text-sm text-[#525252] mt-1">
            {isAdmin
              ? "Manage team members and their assignments"
              : "View team members and their information"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A3A3A3]" />
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#E5E5E5]"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-[#E5E5E5]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-[#E5E5E5]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(search || statusFilter !== "all" || departmentFilter !== "all") && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-[#E5E5E5]"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Team Grid */}
      <TeamGrid
        teamMembers={teamMembers}
        onView={handleView}
        onDelete={isAdmin ? handleDelete : undefined}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#525252]">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} team members
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="border-[#E5E5E5]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.totalPages}
              className="border-[#E5E5E5]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-[#E5E5E5]">
            <h3 className="text-lg font-semibold text-[#171717] mb-2">
              Delete Team Member
            </h3>
            <p className="text-[#525252] mb-6">
              Are you sure you want to delete{" "}
              <strong>{deletingMember.fullName}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeletingMember(null)}
                className="border-[#E5E5E5]"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
