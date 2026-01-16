"use client";

import { useState } from "react";
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
  useState(() => {
    if (meetingId && open) {
      getMeeting(meetingId).then(setMeeting);
    }
  });

  const handleSubmit = async (data: MeetingFormData) => {
    setIsLoading(true);
    try {
      if (meetingId) {
        await updateMeeting(meetingId, data);
      } else {
        await createMeeting(data);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
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
