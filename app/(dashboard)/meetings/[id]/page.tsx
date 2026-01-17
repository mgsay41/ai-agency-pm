"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMeetings } from "@/hooks/use-meetings";
import { meetingTypeLabels } from "@/lib/validations/meeting";
import { MeetingDetailsForm } from "@/components/meetings/meeting-details-form";
import { ActionItemsManager } from "@/components/meetings/action-items-manager";
import { AttendanceManager } from "@/components/meetings/attendance-manager";
import { NextMeetingForm } from "@/components/meetings/next-meeting-form";
import { logger } from "@/lib/logger";

// Type definitions
interface MeetingAttendee {
  id: string;
  attendeeType: string;
  name?: string;
  email?: string;
  externalName?: string;
  externalEmail?: string;
  attended?: boolean;
  TeamMember?: {
    fullName: string;
    roleTitle?: string;
    avatarColor?: string;
  };
}

interface ActionItem {
  id: string;
  description: string;
  status: string;
  dueDate?: string;
  assignedTo?: string;
  TeamMember?: {
    fullName: string;
  };
}

interface MeetingDetail {
  id: string;
  meetingDate: string;
  durationMinutes?: number;
  meetingType: string;
  locationPlatform?: string;
  agenda?: string;
  notes?: string;
  transcript?: string;
  recordingUrl?: string;
  nextMeetingDate?: string;
  nextMeetingNotes?: string;
  Project?: {
    id: string;
    projectName: string;
    Client?: {
      companyName: string;
    };
  };
  MeetingAttendee: MeetingAttendee[];
  ActionItem: ActionItem[];
}

interface TeamMember {
  id: string;
  fullName: string;
}

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params?.id as string;

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { getMeeting } = useMeetings();

  // Helper function to check if text is a URL
  const isUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return text.startsWith("http://") || text.startsWith("https://");
    }
  };

  // Helper function to get a friendly name for meeting platform URLs
  const getMeetingPlatformLabel = (url: string) => {
    if (url.includes("meet.google.com")) return "Google Meet";
    if (url.includes("zoom.us")) return "Zoom Meeting";
    if (url.includes("teams.microsoft.com")) return "Microsoft Teams";
    if (url.includes("webex.com")) return "Webex Meeting";
    // For other URLs, show the domain
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const loadMeeting = async () => {
    setIsLoading(true);
    try {
      const data = await getMeeting(meetingId);
      setMeeting(data);
    } catch (error) {
      logger.error("Failed to load meeting", error, { action: "fetch_meeting_detail" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team");
      if (response.ok) {
        const result = await response.json();
        // The API returns { success: true, data: { teamMembers: [...], pagination: {...} } }
        const members = result.data?.teamMembers || [];
        setTeamMembers(Array.isArray(members) ? members : []);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      logger.error("Failed to fetch team members", error, { action: "fetch_team_members" });
      setTeamMembers([]);
    }
  };

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.data?.role || null);
      }
    } catch (error) {
      logger.error("Failed to fetch user role", error, { action: "fetch_user_role" });
    }
  };

  useEffect(() => {
    if (meetingId) {
      loadMeeting();
      fetchTeamMembers();
      fetchUserRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#525252]">Loading meeting details...</div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-semibold text-[#171717] mb-2">Meeting not found</h2>
          <Button
            variant="outline"
            onClick={() => router.push("/meetings")}
            className="border-[#E5E5E5]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Button>
        </div>
      </div>
    );
  }

  // Check if user can edit (Admin or Sales only)
  const canEdit = userRole === "ADMIN" || userRole === "SALES";

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/meetings")}
              className="text-[#525252]"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-2xl font-semibold text-[#171717]">Meeting Details</h1>
          <p className="text-[#525252]">
            {format(new Date(meeting.meetingDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-[#171717]">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#A3A3A3]" />
                  <div>
                    <div className="text-sm text-[#525252]">Date</div>
                    <div className="font-medium text-[#171717]">
                      {format(new Date(meeting.meetingDate), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>

                {meeting.durationMinutes && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#A3A3A3]" />
                    <div>
                      <div className="text-sm text-[#525252]">Duration</div>
                      <div className="font-medium text-[#171717]">
                        {meeting.durationMinutes} minutes
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20"
                  >
                    {meetingTypeLabels[meeting.meetingType as keyof typeof meetingTypeLabels]}
                  </Badge>
                </div>

                {meeting.locationPlatform && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#A3A3A3]" />
                    <div>
                      <div className="text-sm text-[#525252]">Location</div>
                      {isUrl(meeting.locationPlatform) ? (
                        <div>
                          <a
                            href={meeting.locationPlatform}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#2563EB] hover:underline flex items-center gap-1.5"
                            title={meeting.locationPlatform}
                          >
                            {getMeetingPlatformLabel(meeting.locationPlatform)}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <div className="text-xs text-[#A3A3A3] mt-0.5 truncate max-w-50">
                            {meeting.locationPlatform}
                          </div>
                        </div>
                      ) : (
                        <div className="font-medium text-[#171717]">
                          {meeting.locationPlatform}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-[#E5E5E5]" />

              {meeting.Project && (
                <div>
                  <Link
                    href={`/projects/${meeting.Project.id}`}
                    className="text-[#2563EB] hover:underline flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {meeting.Project.projectName}
                  </Link>
                  {meeting.Project.Client && (
                    <p className="text-sm text-[#525252] mt-1">
                      Client: {meeting.Project.Client.companyName}
                    </p>
                  )}
                </div>
              )}

              {meeting.recordingUrl && (
                <div>
                  <a
                    href={meeting.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563EB] hover:underline flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Recording
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agenda */}
          {meeting.agenda && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-[#171717]">Agenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[#171717] whitespace-pre-wrap">{meeting.agenda}</div>
              </CardContent>
            </Card>
          )}

          {/* Meeting Details Form (Notes, Transcript, Recording URL) */}
          <MeetingDetailsForm
            meetingId={meetingId}
            initialNotes={meeting.notes || ""}
            initialTranscript={meeting.transcript || ""}
            initialRecordingUrl={meeting.recordingUrl || ""}
            canEdit={canEdit}
            onSuccess={loadMeeting}
          />

          {/* Next Meeting Form */}
          <NextMeetingForm
            meetingId={meetingId}
            initialNextMeetingDate={meeting.nextMeetingDate ? String(meeting.nextMeetingDate) : ""}
            initialNextMeetingNotes={meeting.nextMeetingNotes || ""}
            canEdit={canEdit}
            onSuccess={loadMeeting}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Attendance Manager - Admin/Sales can edit, Team Members view-only */}
          <AttendanceManager
            meetingId={meetingId}
            initialAttendees={meeting.MeetingAttendee.map(a => ({
              ...a,
              attended: a.attended ?? true
            }))}
            canEdit={canEdit}
            onSuccess={loadMeeting}
          />

          {/* Action Items Manager - Admin/Sales can edit, Team Members view-only */}
          <ActionItemsManager
            meetingId={meetingId}
            initialActionItems={meeting.ActionItem}
            teamMembers={teamMembers}
            canEdit={canEdit}
            onSuccess={loadMeeting}
          />
        </div>
      </div>
    </div>
  );
}
