"use client";

import { useState, useEffect } from "react";
import { PAGINATION } from "@/lib/constants";

interface DashboardStats {
  activeProjects: number;
  planningProjects: number;
  overdueProjects: number;
  activeTeamMembers: number;
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  projectsByPriority: Record<string, number>;
  upcomingDeadlines: Array<{
    id: string;
    projectName: string;
    endDate: Date;
    status: string;
    priority: string;
    clientName: string;
  }>;
}

interface Activity {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  createdAt: Date;
  User: {
    id: string;
    name: string;
    email: string;
  };
}

interface ActivityResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, isLoading, error, refetch: fetchStats };
}

export function useRecentActivity(
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.ACTIVITY_LIMIT
) {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/dashboard/activity?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recent activity");
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [page, limit]);

  return { data, isLoading, error, refetch: fetchActivity };
}
