"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MeetingForm } from "./meeting-form";
import { useMeetings } from "@/hooks/use-meetings";
import type { MeetingFormData } from "@/lib/validations/meeting";

interface MeetingDialogProps {
  projectId?: string;
  meetingId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MeetingDialog({
  projectId,
  meetingId,
  open,
  onOpenChange,
  onSuccess,
}: MeetingDialogProps) {
  const { createMeeting, updateMeeting, getMeeting } = useMeetings();
  const [isLoading, setIsLoading] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);

  // Load meeting data if editing
  useEffect(() => {
    if (meetingId && open) {
      console.log("Loading meeting:", meetingId);
      getMeeting(meetingId).then((data) => {
        console.log("Received meeting data from API:", data);

        // Transform API response to form data format
        const transformedData = {
          ...data,
          attendees: data.MeetingAttendee?.map((attendee: any) => ({
            memberId: attendee.memberId || undefined,
            externalName: attendee.externalName || undefined,
            externalEmail: attendee.externalEmail || undefined,
            attendeeType: attendee.attendeeType,
            attended: attendee.attended || false,
          })) || [],
          actionItems: data.ActionItem?.map((item: any) => ({
            description: item.description,
            assignedTo: item.assignedTo || undefined,
            dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
            status: item.status || "OPEN",
          })) || [],
        };

        console.log("Transformed meeting data:", transformedData);
        setMeeting(transformedData);
      }).catch((error) => {
        console.error("Error loading meeting:", error);
      });
    } else if (!open) {
      // Reset meeting data when dialog closes
      setMeeting(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, open]);

  const handleSubmit = async (data: MeetingFormData) => {
    console.log("handleSubmit called with data:", data);
    console.log("meetingId:", meetingId);
    setIsLoading(true);
    try {
      if (meetingId) {
        console.log("Updating meeting...");
        await updateMeeting(meetingId, data);
        console.log("Meeting updated successfully");
      } else {
        console.log("Creating meeting...");
        await createMeeting(data);
        console.log("Meeting created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      // Error is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-[#E5E5E5] bg-[#FAFAFA]">
          <DialogTitle className="text-2xl font-semibold text-[#171717]">
            {meetingId ? "Edit Meeting" : "Create New Meeting"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#525252] mt-2">
            {meetingId
              ? "Update meeting details, attendees, and action items."
              : "Add a new meeting with attendees and action items."}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-8 py-6">
          <MeetingForm
            projectId={projectId}
            defaultValues={meeting}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
