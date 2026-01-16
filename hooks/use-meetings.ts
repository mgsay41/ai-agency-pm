"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { MeetingFormData } from "@/lib/validations/meeting";

export interface Meeting {
  id: string;
  projectId: string;
  meetingDate: Date;
  durationMinutes: number | null;
  meetingType: string;
  locationPlatform: string | null;
  agenda: string | null;
  notes: string | null;
  transcript: string | null;
  recordingUrl: string | null;
  nextMeetingDate: Date | null;
  nextMeetingNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  Project?: {
    id: string;
    projectName: string;
    projectCode: string | null;
  };
  MeetingAttendee?: any[];
  ActionItem?: any[];
}

interface UseMeetingsOptions {
  projectId?: string;
  meetingType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Hook for managing meetings CRUD operations
 */
export function useMeetings(options: UseMeetingsOptions = {}) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    limit: options.limit || 25,
    total: 0,
    totalPages: 0,
  });

  /**
   * Fetch meetings with filters
   */
  const fetchMeetings = async (customOptions?: UseMeetingsOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const opts = { ...options, ...customOptions };

      if (opts.projectId) params.append("projectId", opts.projectId);
      if (opts.meetingType) params.append("meetingType", opts.meetingType);
      if (opts.search) params.append("search", opts.search);
      if (opts.startDate) params.append("startDate", opts.startDate);
      if (opts.endDate) params.append("endDate", opts.endDate);
      if (opts.sortBy) params.append("sortBy", opts.sortBy);
      if (opts.sortOrder) params.append("sortOrder", opts.sortOrder);
      if (opts.page) params.append("page", opts.page.toString());
      if (opts.limit) params.append("limit", opts.limit.toString());

      const response = await fetch(`/api/meetings?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch meetings");
      }

      const data = await response.json();
      setMeetings(data.data);
      setPagination(data.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch meetings";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new meeting
   */
  const createMeeting = async (data: MeetingFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create meeting");
      }

      const result = await response.json();
      toast.success("Meeting created successfully");

      // Refresh meetings list
      await fetchMeetings();

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create meeting";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update a meeting
   */
  const updateMeeting = async (id: string, data: Partial<MeetingFormData>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update meeting");
      }

      const result = await response.json();
      toast.success("Meeting updated successfully");

      // Refresh meetings list
      await fetchMeetings();

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update meeting";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a meeting
   */
  const deleteMeeting = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete meeting");
      }

      toast.success("Meeting deleted successfully");

      // Refresh meetings list
      await fetchMeetings();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete meeting";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get a single meeting by ID
   */
  const getMeeting = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/meetings/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch meeting");
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch meeting";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    meetings,
    isLoading,
    error,
    pagination,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeeting,
  };
}
