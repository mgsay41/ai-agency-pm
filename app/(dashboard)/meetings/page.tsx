"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingsGrid } from "@/components/meetings/meetings-grid";
import { MeetingDialog } from "@/components/meetings/meeting-dialog";
import { MeetingFilters } from "@/components/meetings/meeting-filters";
import { useMeetings } from "@/hooks/use-meetings";

export default function MeetingsPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | undefined>();
  const [filters, setFilters] = useState<any>({});

  const { meetings, isLoading, fetchMeetings, deleteMeeting, pagination } =
    useMeetings(filters);

  // Fetch meetings on mount and when filters change
  useEffect(() => {
    fetchMeetings();
  }, [filters]);

  const handleEdit = (meetingId: string) => {
    setEditingMeetingId(meetingId);
    setDialogOpen(true);
  };

  const handleView = (meetingId: string) => {
    router.push(`/meetings/${meetingId}`);
  };

  const handleDelete = async (meetingId: string) => {
    await deleteMeeting(meetingId);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingMeetingId(undefined);
  };

  const handleSuccess = () => {
    fetchMeetings();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Meetings</h1>
          <p className="text-[#525252] mt-1">
            Manage all meetings, transcripts, and action items
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingMeetingId(undefined);
            setDialogOpen(true);
          }}
          className="bg-[#18181B] hover:bg-[#27272A]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Meeting
        </Button>
      </div>

      {/* Filters */}
      <MeetingFilters onFilterChange={setFilters} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
          <div className="text-sm text-[#525252]">Total Meetings</div>
          <div className="text-2xl font-semibold text-[#171717] mt-1">
            {pagination.total}
          </div>
        </div>
        <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
          <div className="text-sm text-[#525252]">This Week</div>
          <div className="text-2xl font-semibold text-[#171717] mt-1">
            {meetings.filter((m) => {
              const date = new Date(m.meetingDate);
              const now = new Date();
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return date >= weekAgo && date <= now;
            }).length}
          </div>
        </div>
        <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
          <div className="text-sm text-[#525252]">With Transcripts</div>
          <div className="text-2xl font-semibold text-[#171717] mt-1">
            {meetings.filter((m) => m.transcript).length}
          </div>
        </div>
        <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
          <div className="text-sm text-[#525252]">Action Items</div>
          <div className="text-2xl font-semibold text-[#171717] mt-1">
            {meetings.reduce((acc, m) => acc + (m.ActionItem?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Meetings Grid */}
      <MeetingsGrid
        meetings={meetings}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#525252]">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} meetings
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMeetings({ page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="border-[#E5E5E5]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMeetings({ page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
              className="border-[#E5E5E5]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Meeting Dialog */}
      <MeetingDialog
        meetingId={editingMeetingId}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
