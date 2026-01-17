"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  projectType: string;
  status: string;
  priority: string;
  description: string | null;
  internalNotes: string | null;
  startDate: string;
  endDate: string;
  budgetAmount: number | null;
  currency: string;
  clientId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  Client?: {
    id: string;
    companyName: string;
  };
  ProjectAssignment?: Array<{
    id: string;
    roleInProject: string;
    allocationPercentage: number;
    TeamMember: {
      id: string;
      fullName: string;
      email: string;
      roleTitle: string | null;
      avatarColor: string | null;
    };
  }>;
}

export interface ProjectFilters {
  status?: string[];
  priority?: string[];
  clientId?: string;
  projectType?: string;
  search?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProjects = useCallback(
    async (filters?: ProjectFilters, page = 1, pageSize = 25) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        if (filters?.status && filters.status.length > 0) {
          params.append("status", filters.status.join(","));
        }
        if (filters?.priority && filters.priority.length > 0) {
          params.append("priority", filters.priority.join(","));
        }
        if (filters?.clientId) {
          params.append("clientId", filters.clientId);
        }
        if (filters?.projectType) {
          params.append("projectType", filters.projectType);
        }
        if (filters?.search) {
          params.append("search", filters.search);
        }

        const response = await fetch(`/api/projects?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const responseData = await response.json();
        // API returns { success: true, data: { projects: [...], pagination: {...} } }
        setProjects(responseData.data?.projects || []);
        return responseData;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createProject = useCallback(
    async (projectData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create project");
        }

        const data = await response.json();
        router.refresh();
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const updateProject = useCallback(
    async (id: string, projectData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update project");
        }

        const data = await response.json();
        router.refresh();
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete project");
        }

        router.refresh();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
