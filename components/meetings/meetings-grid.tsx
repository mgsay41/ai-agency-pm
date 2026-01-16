"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, Edit, ExternalLink, FileText, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { meetingTypeLabels } from "@/lib/validations/meeting";
import type { Meeting } from "@/hooks/use-meetings";

interface MeetingsGridProps {
  meetings: Meeting[];
  onEdit?: (meetingId: string) => void;
  onDelete?: (meetingId: string) => void;
  onView?: (meetingId: string) => void;
  isLoading?: boolean;
}

export function MeetingsGrid({
  meetings,
  onEdit,
  onDelete,
  onView,
  isLoading,
}: MeetingsGridProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#525252]">Loading meetings...</div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA]">
        <Calendar className="h-12 w-12 text-[#A3A3A3] mb-4" />
        <h3 className="text-lg font-semibold text-[#171717] mb-2">No meetings found</h3>
        <p className="text-[#525252] text-center max-w-md">
          Get started by creating your first meeting record.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-[#FAFAFA]">
            <TableRow>
              <TableHead className="text-[#525252] text-xs uppercase tracking-wide">
                Date & Time
              </TableHead>
              <TableHead className="text-[#525252] text-xs uppercase tracking-wide">
                Type
              </TableHead>
              <TableHead className="text-[#525252] text-xs uppercase tracking-wide">
                Project
              </TableHead>
              <TableHead className="text-[#525252] text-xs uppercase tracking-wide">
                Duration
              </TableHead>
              <TableHead className="text-[#525252] text-xs uppercase tracking-wide">
                Attendees
              </TableHead>
              <TableHead className="text-[#525252] text-xs uppercase tracking-wide">
                Details
              </TableHead>
              <TableHead className="text-[#525252] text-xs uppercase tracking-wide text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map((meeting) => (
              <TableRow
                key={meeting.id}
                className="hover:bg-[#FAFAFA] border-b border-[#E5E5E5]"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#A3A3A3]" />
                    <div>
                      <div className="font-medium text-[#171717]">
                        {format(new Date(meeting.meetingDate), "MMM d, yyyy")}
                      </div>
                      <div className="text-sm text-[#525252]">
                        {format(new Date(meeting.meetingDate), "h:mm a")}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20"
                  >
                    {meetingTypeLabels[meeting.meetingType as keyof typeof meetingTypeLabels] ||
                      meeting.meetingType}
                  </Badge>
                </TableCell>

                <TableCell>
                  {meeting.Project ? (
                    <>
                      <Link
                        href={`/projects/${meeting.projectId}`}
                        className="text-[#171717] hover:underline"
                      >
                        {meeting.Project.projectName}
                      </Link>
                      {meeting.Project.projectCode && (
                        <div className="text-xs text-[#A3A3A3]">
                          {meeting.Project.projectCode}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[#A3A3A3]">-</span>
                  )}
                </TableCell>

                <TableCell>
                  {meeting.durationMinutes ? (
                    <div className="flex items-center gap-1 text-[#525252]">
                      <Clock className="h-4 w-4" />
                      <span>{meeting.durationMinutes} min</span>
                    </div>
                  ) : (
                    <span className="text-[#A3A3A3]">-</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-[#A3A3A3]" />
                    <span className="text-[#525252]">
                      {meeting.MeetingAttendee?.length || 0}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    {meeting.transcript && (
                      <FileText className="h-4 w-4 text-[#16A34A]" />
                    )}
                    {meeting.ActionItem && meeting.ActionItem.length > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-[#FFF7ED] text-[#EA580C] border-[#EA580C]/20 text-xs"
                      >
                        {meeting.ActionItem.length} items
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(meeting.id)}
                        title="View meeting"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(meeting.id)}
                        title="Edit meeting"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(meeting.id)}
                        title="Delete meeting"
                      >
                        <Trash2 className="h-4 w-4 text-[#DC2626]" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone and
              will also delete all attendees and action items associated with this meeting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
