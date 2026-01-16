"use client";

import { useState } from "react";
import { TeamMemberFormData } from "@/lib/validations/team";

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  roleTitle: string;
  department: string;
  specialization: string[];
  skills: string[];
  hourlyRate: number | null;
  currency: string;
  employmentType: string;
  startDate: Date | null;
  status: string;
  avatarColor: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    ProjectAssignment: number;
  };
  ProjectAssignment?: any[];
}

export interface TeamFilters {
  status?: string;
  department?: string;
  search?: string;
  skills?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useTeam() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all team members
  const fetchTeamMembers = async (filters: TeamFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.department) params.append("department", filters.department);
      if (filters.search) params.append("search", filters.search);
      if (filters.skills && filters.skills.length > 0) {
        params.append("skills", filters.skills.join(","));
      }
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/team?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single team member
  const fetchTeamMember = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/team/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch team member");
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create team member
  const createTeamMember = async (data: TeamMemberFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create team member");
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update team member
  const updateTeamMember = async (id: string, data: Partial<TeamMemberFormData>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/team/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update team member");
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete team member
  const deleteTeamMember = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/team/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete team member");
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchTeamMembers,
    fetchTeamMember,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
  };
}
