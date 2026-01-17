"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Save, X, CheckCircle, Users } from "lucide-react";
import { logger } from "@/lib/logger";

interface Attendee {
  id: string;
  attendeeType: string;
  attended: boolean;
  externalName?: string;
  externalEmail?: string;
  TeamMember?: {
    id: string;
    fullName: string;
    roleTitle?: string;
    avatarColor?: string;
  };
}

interface AttendanceManagerProps {
  meetingId: string;
  initialAttendees: Attendee[];
  canEdit?: boolean;
  onSuccess: () => void;
}

export function AttendanceManager({
  meetingId,
  initialAttendees,
  canEdit = true,
  onSuccess,
}: AttendanceManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);

  useEffect(() => {
    setAttendees(initialAttendees);
  }, [initialAttendees]);

  const handleToggleAttendance = (attendeeId: string) => {
    setAttendees(
      attendees.map((attendee) =>
        attendee.id === attendeeId
          ? { ...attendee, attended: !attendee.attended }
          : attendee
      )
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Find which attendees have changed
      const updates = attendees
        .filter((attendee, index) => {
          const original = initialAttendees[index];
          return original && attendee.attended !== original.attended;
        })
        .map((attendee) => ({
          attendeeId: attendee.id,
          attended: attendee.attended,
        }));

      if (updates.length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await fetch(`/api/meetings/${meetingId}/attendance`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      setIsEditing(false);
      onSuccess();
    } catch (error) {
      logger.error("Failed to update attendance", error, { action: "update_attendance" });
      alert("Failed to update attendance. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAttendees(initialAttendees);
    setIsEditing(false);
  };

  const attendedCount = attendees.filter((a) => a.attended).length;

  if (!isEditing) {
    return (
      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#171717] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Attendees ({attendedCount}/{initialAttendees.length})
            </CardTitle>
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-[#E5E5E5]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {initialAttendees.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center justify-between p-2 rounded border border-[#E5E5E5]"
              >
                <div className="flex items-center gap-2">
                  {attendee.attendeeType === "INTERNAL" && attendee.TeamMember ? (
                    <>
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          backgroundColor: attendee.TeamMember.avatarColor || "#A3A3A3",
                        }}
                      >
                        {attendee.TeamMember.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[#171717]">
                          {attendee.TeamMember.fullName}
                        </div>
                        <div className="text-xs text-[#525252]">
                          {attendee.TeamMember.roleTitle}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="font-medium text-[#171717]">
                        {attendee.externalName}
                      </div>
                      <div className="text-xs text-[#525252]">{attendee.externalEmail}</div>
                    </div>
                  )}
                </div>
                {attendee.attended && (
                  <CheckCircle className="h-4 w-4 text-[#16A34A]" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E5E5E5]">
      <CardHeader>
        <CardTitle className="text-[#171717]">Mark Attendance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {attendees.map((attendee) => (
            <div
              key={attendee.id}
              className="flex items-center justify-between p-3 rounded border border-[#E5E5E5]"
            >
              <div className="flex items-center gap-3">
                {attendee.attendeeType === "INTERNAL" && attendee.TeamMember ? (
                  <>
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        backgroundColor: attendee.TeamMember.avatarColor || "#A3A3A3",
                      }}
                    >
                      {attendee.TeamMember.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-[#171717]">
                        {attendee.TeamMember.fullName}
                      </div>
                      <div className="text-xs text-[#525252]">
                        {attendee.TeamMember.roleTitle}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="font-medium text-[#171717]">
                      {attendee.externalName}
                    </div>
                    <div className="text-xs text-[#525252]">{attendee.externalEmail}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`attended-${attendee.id}`}
                  checked={attendee.attended}
                  onCheckedChange={() => handleToggleAttendance(attendee.id)}
                />
                <label
                  htmlFor={`attended-${attendee.id}`}
                  className="text-sm text-[#525252] cursor-pointer"
                >
                  Attended
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-[#E5E5E5]">
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
            {isLoading ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
