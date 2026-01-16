"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectSelect } from "@/components/meetings/project-select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  meetingFormSchema,
  meetingTypeValues,
  meetingTypeLabels,
  actionItemStatusValues,
  actionItemStatusLabels,
  type MeetingFormData,
  type MeetingFormInput,
} from "@/lib/validations/meeting";
import { logger } from "@/lib/logger";

interface MeetingFormProps {
  projectId?: string;
  defaultValues?: Partial<MeetingFormData>;
  onSubmit: (data: MeetingFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MeetingForm({
  projectId,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: MeetingFormProps) {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(
    defaultValues?.meetingDate
  );
  const [nextMeetingDate, setNextMeetingDate] = useState<Date | undefined>(
    defaultValues?.nextMeetingDate
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<MeetingFormInput>({
    resolver: zodResolver(meetingFormSchema),
    mode: "onTouched",
    reValidateMode: "onSubmit",
    defaultValues: {
      projectId: projectId || defaultValues?.projectId || "",
      meetingType: defaultValues?.meetingType || "INTERNAL_SYNC",
      durationMinutes: defaultValues?.durationMinutes,
      locationPlatform: defaultValues?.locationPlatform || "",
      agenda: defaultValues?.agenda || "",
      notes: defaultValues?.notes || "",
      transcript: defaultValues?.transcript || "",
      recordingUrl: defaultValues?.recordingUrl || "",
      nextMeetingNotes: defaultValues?.nextMeetingNotes || "",
      attendees: defaultValues?.attendees || [],
      actionItems: defaultValues?.actionItems || [],
    },
  });

  const {
    fields: attendeeFields,
    append: appendAttendee,
    remove: removeAttendee,
  } = useFieldArray({
    control,
    name: "attendees",
  });

  const {
    fields: actionItemFields,
    append: appendActionItem,
    remove: removeActionItem,
  } = useFieldArray({
    control,
    name: "actionItems",
  });

  // Fetch team members
  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        // API returns { success: true, data: { teamMembers: [...], pagination: {...} } }
        if (data.success && data.data?.teamMembers) {
          setTeamMembers(data.data.teamMembers);
        } else {
          setTeamMembers([]);
        }
      })
      .catch((error) => {
        logger.error("Failed to fetch team members", error, { action: "fetch_team_members_for_meeting" });
        setTeamMembers([]);
      });
  }, []);

  // Fetch projects if projectId not provided
  useEffect(() => {
    if (!projectId) {
      fetch("/api/projects")
        .then((res) => res.json())
        .then((data) => {
          // API returns { success: true, data: { projects: [...], pagination: {...} } }
          if (data.success && data.data?.projects) {
            setProjects(data.data.projects);
          } else {
            setProjects([]);
          }
        })
        .catch((error) => {
          logger.error("Failed to fetch projects", error, { action: "fetch_projects_for_meeting" });
          setProjects([]);
        });
    }
  }, [projectId]);

  const handleFormSubmit = async (data: MeetingFormInput) => {
    // Validate that meetingDate is selected
    if (!meetingDate) {
      return;
    }

    const submitData: MeetingFormData = {
      ...data,
      meetingDate: meetingDate,
      nextMeetingDate: nextMeetingDate || undefined,
    };
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
          <div className="h-8 w-1 bg-[#18181B] rounded-full"></div>
          <h3 className="text-base font-semibold text-[#171717]">Basic Information</h3>
        </div>

        {/* Project Selection */}
        {!projectId && (
          <div className="space-y-2">
            <Label htmlFor="projectId" className="text-sm font-medium text-[#171717]">
              Project <span className="text-[#DC2626]">*</span>
            </Label>
            <ProjectSelect
              projects={projects}
              value={watch("projectId")}
              onValueChange={(value) => setValue("projectId", value)}
              placeholder="Select project"
            />
            {watch("projectId") === "__new_project__" && (
              <div className="flex items-start gap-2 p-3 bg-[#F0F9FF] border border-[#BFDBFE] rounded-lg">
                <span className="text-[#2563EB] mt-0.5">ℹ️</span>
                <p className="text-xs text-[#1E40AF]">
                  Meeting will be created without a project. You can assign it to a project later by editing the meeting.
                </p>
              </div>
            )}
            {errors.projectId && (
              <p className="text-sm text-[#DC2626] flex items-center gap-1">
                <span>⚠</span>
                {errors.projectId.message}
              </p>
            )}
          </div>
        )}

        {/* Meeting Date & Time */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#171717]">
                Meeting Date <span className="text-[#DC2626]">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left border-[#E5E5E5] hover:bg-[#FAFAFA] hover:border-[#A3A3A3] ${
                      !meetingDate ? 'text-[#A3A3A3]' : 'text-[#171717]'
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {meetingDate ? format(meetingDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={meetingDate}
                    onSelect={(date) => {
                      if (date) {
                        // If there's already a time set, preserve it
                        if (meetingDate) {
                          date.setHours(meetingDate.getHours(), meetingDate.getMinutes());
                        } else {
                          // Otherwise set to current time
                          const now = new Date();
                          date.setHours(now.getHours(), now.getMinutes());
                        }
                      }
                      setMeetingDate(date);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.meetingDate && (
                <p className="text-sm text-[#DC2626] flex items-center gap-1">
                  <span>⚠</span>
                  {errors.meetingDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingTime" className="text-sm font-medium text-[#171717]">
                Meeting Time <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="meetingTime"
                type="time"
                className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B]"
                disabled={!meetingDate}
                value={
                  meetingDate
                    ? `${String(meetingDate.getHours()).padStart(2, "0")}:${String(
                        meetingDate.getMinutes()
                      ).padStart(2, "0")}`
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) {
                    const [hours, minutes] = e.target.value.split(":");
                    const newDate = meetingDate ? new Date(meetingDate) : new Date();
                    newDate.setHours(parseInt(hours), parseInt(minutes));
                    setMeetingDate(newDate);
                  }
                }}
              />
              {!meetingDate && (
                <p className="text-xs text-[#A3A3A3]">Select a date first</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes" className="text-sm font-medium text-[#171717]">
                Duration (minutes)
              </Label>
              <Input
                id="durationMinutes"
                type="number"
                {...register("durationMinutes", { valueAsNumber: true })}
                className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B]"
                placeholder="60"
              />
              {errors.durationMinutes && (
                <p className="text-sm text-[#DC2626] flex items-center gap-1">
                  <span>⚠</span>
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationPlatform" className="text-sm font-medium text-[#171717]">
                Location/Platform
              </Label>
              <Input
                id="locationPlatform"
                {...register("locationPlatform")}
                className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B]"
                placeholder="Zoom, Office, Google Meet"
              />
            </div>
          </div>
        </div>

        {/* Meeting Type */}
        <div className="space-y-2">
          <Label htmlFor="meetingType" className="text-sm font-medium text-[#171717]">
            Meeting Type <span className="text-[#DC2626]">*</span>
          </Label>
          <Select
            value={watch("meetingType")}
            onValueChange={(value) => setValue("meetingType", value as any)}
          >
            <SelectTrigger className="border-[#E5E5E5] hover:border-[#A3A3A3]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {meetingTypeValues.map((type) => (
                <SelectItem key={type} value={type}>
                  {meetingTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.meetingType && (
            <p className="text-sm text-[#DC2626] flex items-center gap-1">
              <span>⚠</span>
              {errors.meetingType.message}
            </p>
          )}
        </div>
      </div>

      {/* Attendees */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
          <div className="h-8 w-1 bg-[#18181B] rounded-full"></div>
          <h3 className="text-base font-semibold text-[#171717] flex-1">Attendees</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendAttendee({
                attendeeType: "INTERNAL",
                attended: true,
              })
            }
            className="border-[#E5E5E5] hover:bg-[#FAFAFA] hover:border-[#18181B]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Attendee
          </Button>
        </div>

        {attendeeFields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-[#E5E5E5] rounded-lg bg-[#FAFAFA]">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <Plus className="h-6 w-6 text-[#A3A3A3]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#171717]">No attendees added yet</p>
                <p className="text-xs text-[#A3A3A3] mt-1">Add team members or external guests to track attendance</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendAttendee({
                    attendeeType: "INTERNAL",
                    attended: true,
                  })
                }
                className="border-[#E5E5E5] hover:bg-white hover:border-[#18181B]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Attendee
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {attendeeFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-[#E5E5E5] rounded-lg space-y-3 bg-white hover:border-[#A3A3A3] transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <Select
                    value={watch(`attendees.${index}.attendeeType`)}
                    onValueChange={(value) =>
                      setValue(`attendees.${index}.attendeeType`, value as any)
                    }
                  >
                    <SelectTrigger className="w-40 border-[#E5E5E5] hover:border-[#A3A3A3]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERNAL">Internal</SelectItem>
                      <SelectItem value="EXTERNAL">External</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttendee(index)}
                    className="hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {watch(`attendees.${index}.attendeeType`) === "INTERNAL" ? (
                  <Select
                    value={watch(`attendees.${index}.memberId`)}
                    onValueChange={(value) => setValue(`attendees.${index}.memberId`, value)}
                  >
                    <SelectTrigger className="border-[#E5E5E5] hover:border-[#A3A3A3]">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      {...register(`attendees.${index}.externalName`)}
                      placeholder="Name"
                      className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B]"
                    />
                    <Input
                      {...register(`attendees.${index}.externalEmail`)}
                      type="email"
                      placeholder="Email"
                      className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B]"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id={`attended-${index}`}
                    checked={watch(`attendees.${index}.attended`)}
                    onCheckedChange={(checked) =>
                      setValue(`attendees.${index}.attended`, checked as boolean)
                    }
                  />
                  <Label htmlFor={`attended-${index}`} className="text-sm font-normal text-[#525252] cursor-pointer">
                    Attended meeting
                  </Label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meeting Content */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
          <div className="h-8 w-1 bg-[#18181B] rounded-full"></div>
          <h3 className="text-base font-semibold text-[#171717]">Meeting Content</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="agenda" className="text-sm font-medium text-[#171717]">
            Agenda
          </Label>
          <Textarea
            id="agenda"
            {...register("agenda")}
            rows={3}
            className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B] resize-none"
            placeholder="Meeting agenda..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-[#171717]">
            Notes
          </Label>
          <Textarea
            id="notes"
            {...register("notes")}
            rows={4}
            className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B] resize-none"
            placeholder="Meeting notes..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transcript" className="text-sm font-medium text-[#171717]">
            Transcript
          </Label>
          <Textarea
            id="transcript"
            {...register("transcript")}
            rows={6}
            className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B] resize-none"
            placeholder="Paste meeting transcript here..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recordingUrl" className="text-sm font-medium text-[#171717]">
            Recording URL
          </Label>
          <Input
            id="recordingUrl"
            type="url"
            {...register("recordingUrl")}
            className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B]"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Action Items */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
          <div className="h-8 w-1 bg-[#18181B] rounded-full"></div>
          <h3 className="text-base font-semibold text-[#171717] flex-1">Action Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendActionItem({
                description: "",
                status: "OPEN",
              })
            }
            className="border-[#E5E5E5] hover:bg-[#FAFAFA] hover:border-[#18181B]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Action Item
          </Button>
        </div>

        {actionItemFields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-[#E5E5E5] rounded-lg bg-[#FAFAFA]">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <Plus className="h-6 w-6 text-[#A3A3A3]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#171717]">No action items yet</p>
                <p className="text-xs text-[#A3A3A3] mt-1">Track tasks and follow-ups from this meeting</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendActionItem({
                    description: "",
                    status: "OPEN",
                  })
                }
                className="border-[#E5E5E5] hover:bg-white hover:border-[#18181B]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Action Item
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {actionItemFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-[#E5E5E5] rounded-lg space-y-3 bg-white hover:border-[#A3A3A3] transition-colors">
                <div className="flex items-start gap-2">
                  <Textarea
                    {...register(`actionItems.${index}.description`)}
                    placeholder="Action item description..."
                    className="flex-1 border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B] resize-none"
                    rows={2}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeActionItem(index)}
                    className="hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#A3A3A3]">Assigned To</Label>
                    <Select
                      value={watch(`actionItems.${index}.assignedTo`)}
                      onValueChange={(value) =>
                        setValue(`actionItems.${index}.assignedTo`, value)
                      }
                    >
                      <SelectTrigger className="border-[#E5E5E5] hover:border-[#A3A3A3]">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-[#A3A3A3]">Status</Label>
                    <Select
                      value={watch(`actionItems.${index}.status`)}
                      onValueChange={(value) =>
                        setValue(`actionItems.${index}.status`, value as any)
                      }
                    >
                      <SelectTrigger className="border-[#E5E5E5] hover:border-[#A3A3A3]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {actionItemStatusValues.map((status) => (
                          <SelectItem key={status} value={status}>
                            {actionItemStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Meeting */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
          <div className="h-8 w-1 bg-[#18181B] rounded-full"></div>
          <h3 className="text-base font-semibold text-[#171717]">Next Meeting</h3>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#171717]">Next Meeting Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left border-[#E5E5E5] hover:bg-[#FAFAFA] hover:border-[#A3A3A3] ${
                  !nextMeetingDate ? 'text-[#A3A3A3]' : 'text-[#171717]'
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {nextMeetingDate ? format(nextMeetingDate, "PPP") : "Pick a date (optional)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={nextMeetingDate}
                onSelect={setNextMeetingDate}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextMeetingNotes" className="text-sm font-medium text-[#171717]">
            Next Meeting Notes
          </Label>
          <Textarea
            id="nextMeetingNotes"
            {...register("nextMeetingNotes")}
            rows={2}
            className="border-[#E5E5E5] hover:border-[#A3A3A3] focus:border-[#18181B] resize-none"
            placeholder="Notes for next meeting..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-6 border-t border-[#E5E5E5]">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-[#E5E5E5] hover:bg-[#FAFAFA] hover:border-[#18181B] min-w-[100px]"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || !meetingDate}
          className="bg-[#18181B] hover:bg-[#27272A] text-white min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Saving...
            </span>
          ) : defaultValues ? "Update Meeting" : "Create Meeting"}
        </Button>
      </div>
    </form>
  );
}
