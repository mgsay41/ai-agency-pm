"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save, X } from "lucide-react";
import { logger } from "@/lib/logger";

interface MeetingDetailsFormProps {
  meetingId: string;
  initialNotes?: string;
  initialTranscript?: string;
  initialRecordingUrl?: string;
  canEdit?: boolean;
  onSuccess: () => void;
}

export function MeetingDetailsForm({
  meetingId,
  initialNotes = "",
  initialTranscript = "",
  initialRecordingUrl = "",
  canEdit = true,
  onSuccess,
}: MeetingDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [recordingUrl, setRecordingUrl] = useState(initialRecordingUrl);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/details`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes,
          transcript,
          recordingUrl: recordingUrl || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update meeting details");
      }

      setIsEditing(false);
      onSuccess();
    } catch (error) {
      logger.error("Failed to update meeting details", error, { action: "update_meeting_details" });
      alert("Failed to update meeting details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNotes(initialNotes);
    setTranscript(initialTranscript);
    setRecordingUrl(initialRecordingUrl);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#171717]">Meeting Details</CardTitle>
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-[#E5E5E5]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialNotes && (
            <div>
              <Label className="text-sm text-[#525252]">Notes</Label>
              <div className="mt-1 text-[#171717] whitespace-pre-wrap">{initialNotes}</div>
            </div>
          )}
          {initialTranscript && (
            <div>
              <Label className="text-sm text-[#525252]">Transcript</Label>
              <div className="mt-1 text-[#171717] whitespace-pre-wrap max-h-48 overflow-y-auto p-4 bg-[#FAFAFA] rounded border border-[#E5E5E5]">
                {initialTranscript}
              </div>
            </div>
          )}
          {initialRecordingUrl && (
            <div>
              <Label className="text-sm text-[#525252]">Recording URL</Label>
              <div className="mt-1">
                <a
                  href={initialRecordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline"
                >
                  {initialRecordingUrl}
                </a>
              </div>
            </div>
          )}
          {!initialNotes && !initialTranscript && !initialRecordingUrl && (
            <p className="text-sm text-[#A3A3A3]">No details added yet. Click "Edit Details" to add notes, transcript, or recording URL.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E5E5E5]">
      <CardHeader>
        <CardTitle className="text-[#171717]">Edit Meeting Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add meeting notes..."
            className="border-[#E5E5E5] min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transcript">Transcript</Label>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Add meeting transcript..."
            className="border-[#E5E5E5] min-h-[200px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recordingUrl">Recording URL</Label>
          <Input
            id="recordingUrl"
            type="url"
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            placeholder="https://example.com/recording"
            className="border-[#E5E5E5]"
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
            {isLoading ? "Saving..." : "Save Details"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
