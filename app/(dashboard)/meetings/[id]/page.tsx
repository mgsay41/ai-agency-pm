"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  MapPin,
  Users,
  CheckCircle,
  Circle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMeetings } from "@/hooks/use-meetings";
import { meetingTypeLabels, actionItemStatusLabels } from "@/lib/validations/meeting";
import { MeetingDialog } from "@/components/meetings/meeting-dialog";
import { logger } from "@/lib/logger";

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params?.id as string;

  const [meeting, setMeeting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  useEffect(() => {
    if (meetingId) {
      loadMeeting();
    }
  }, [meetingId]);

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

  const handleDownloadTranscript = () => {
    if (!meeting?.transcript) return;

    const blob = new Blob([meeting.transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-transcript-${format(new Date(meeting.meetingDate), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#18181B] hover:bg-[#27272A]"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Meeting
        </Button>
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

          {/* Notes */}
          {meeting.notes && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-[#171717]">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[#171717] whitespace-pre-wrap">{meeting.notes}</div>
              </CardContent>
            </Card>
          )}

          {/* Transcript */}
          {meeting.transcript && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#171717]">Transcript</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTranscript}
                    className="border-[#E5E5E5]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-[#171717] whitespace-pre-wrap max-h-96 overflow-y-auto p-4 bg-[#FAFAFA] rounded border border-[#E5E5E5]">
                  {meeting.transcript}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Meeting */}
          {meeting.nextMeetingDate && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-[#171717]">Next Meeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#A3A3A3]" />
                  <span className="font-medium text-[#171717]">
                    {format(new Date(meeting.nextMeetingDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                {meeting.nextMeetingNotes && (
                  <p className="text-[#525252]">{meeting.nextMeetingNotes}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Attendees */}
          <Card className="border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-[#171717] flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendees ({meeting.MeetingAttendee.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {meeting.MeetingAttendee.map((attendee: any) => (
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

          {/* Action Items */}
          {meeting.ActionItem.length > 0 && (
            <Card className="border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-[#171717]">
                  Action Items ({meeting.ActionItem.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {meeting.ActionItem.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 rounded border border-[#E5E5E5] space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        {item.status === "COMPLETED" ? (
                          <CheckCircle className="h-5 w-5 text-[#16A34A] mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-[#A3A3A3] mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-[#171717]">{item.description}</p>
                          {item.TeamMember && (
                            <p className="text-sm text-[#525252] mt-1">
                              Assigned to: {item.TeamMember.fullName}
                            </p>
                          )}
                          {item.dueDate && (
                            <p className="text-sm text-[#525252]">
                              Due: {format(new Date(item.dueDate), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "COMPLETED"
                            ? "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20"
                            : item.status === "IN_PROGRESS"
                            ? "bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20"
                            : "bg-[#FFF7ED] text-[#EA580C] border-[#EA580C]/20"
                        }
                      >
                        {actionItemStatusLabels[item.status as keyof typeof actionItemStatusLabels]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <MeetingDialog
        meetingId={meetingId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadMeeting}
      />
    </div>
  );
}
