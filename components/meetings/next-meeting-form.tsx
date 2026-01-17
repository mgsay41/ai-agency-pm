"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save, X, Calendar } from "lucide-react";
import { logger } from "@/lib/logger";
import { format } from "date-fns";

interface NextMeetingFormProps {
  meetingId: string;
  initialNextMeetingDate?: string;
  initialNextMeetingNotes?: string;
  canEdit?: boolean;
  onSuccess: () => void;
}

export function NextMeetingForm({
  meetingId,
  initialNextMeetingDate = "",
  initialNextMeetingNotes = "",
  canEdit = true,
  onSuccess,
}: NextMeetingFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Safely convert the date to the input format
  const formatDateForInput = (dateString: string): string => {
    if (!dateString || dateString === "") return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const [nextMeetingDate, setNextMeetingDate] = useState(
    formatDateForInput(initialNextMeetingDate)
  );
  const [nextMeetingNotes, setNextMeetingNotes] = useState(initialNextMeetingNotes);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/next-meeting`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nextMeetingDate: nextMeetingDate || null,
          nextMeetingNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update next meeting");
      }

      setIsEditing(false);
      onSuccess();
    } catch (error) {
      logger.error("Failed to update next meeting", error, { action: "update_next_meeting" });
      alert("Failed to update next meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNextMeetingDate(formatDateForInput(initialNextMeetingDate));
    setNextMeetingNotes(initialNextMeetingNotes);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#171717]">Next Meeting</CardTitle>
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-[#E5E5E5]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Next Meeting
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {initialNextMeetingDate && initialNextMeetingDate !== "" ? (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#A3A3A3]" />
                <span className="font-medium text-[#171717]">
                  {format(new Date(initialNextMeetingDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              {initialNextMeetingNotes && (
                <p className="text-[#525252]">{initialNextMeetingNotes}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#A3A3A3]">No next meeting scheduled. Click "Edit Next Meeting" to add details.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E5E5E5]">
      <CardHeader>
        <CardTitle className="text-[#171717]">Edit Next Meeting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nextMeetingDate">Next Meeting Date & Time</Label>
          <Input
            id="nextMeetingDate"
            type="datetime-local"
            value={nextMeetingDate}
            onChange={(e) => setNextMeetingDate(e.target.value)}
            className="border-[#E5E5E5]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextMeetingNotes">Notes</Label>
          <Textarea
            id="nextMeetingNotes"
            value={nextMeetingNotes}
            onChange={(e) => setNextMeetingNotes(e.target.value)}
            placeholder="Add notes for the next meeting..."
            className="border-[#E5E5E5] min-h-[100px]"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="border-[#E5E5E5]"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#18181B] hover:bg-[#27272A]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Next Meeting"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
