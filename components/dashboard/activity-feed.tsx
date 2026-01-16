"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRecentActivity } from "@/hooks/use-dashboard";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Users,
  UserPlus,
  Calendar,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const getEntityIcon = (entityType: string) => {
  switch (entityType) {
    case "project":
      return <Briefcase className="h-4 w-4" />;
    case "client":
      return <Users className="h-4 w-4" />;
    case "team_member":
      return <UserPlus className="h-4 w-4" />;
    case "meeting":
      return <Calendar className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getEntityLink = (entityType: string, entityId: string) => {
  switch (entityType) {
    case "project":
      return `/projects/${entityId}`;
    case "client":
      return `/clients/${entityId}`;
    case "team_member":
      return `/team/${entityId}`;
    case "meeting":
      return `/meetings/${entityId}`;
    default:
      return "#";
  }
};

const getActionText = (action: string, entityType: string) => {
  const actionMap: Record<string, string> = {
    created: "created",
    updated: "updated",
    deleted: "deleted",
    assigned: "assigned to",
  };

  return `${actionMap[action] || action} ${entityType.replace("_", " ")}`;
};

export function ActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading, error } = useRecentActivity(1, 10);

  const displayLimit = 3;
  const activities = data?.activities || [];
  const displayedActivities = showAll
    ? activities
    : activities.slice(0, displayLimit);
  const hasMore = activities.length > displayLimit;

  if (isLoading) {
    return (
      <Card className="border-[#E5E5E5] rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-[#171717]">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#525252]">Loading activity...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[#E5E5E5] rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-[#171717]">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.activities.length === 0) {
    return (
      <Card className="border-[#E5E5E5] rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-[#171717]">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#525252]">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E5E5E5] rounded-lg h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#171717]">
            Recent Activity
          </CardTitle>
          <span className="text-xs text-[#A3A3A3]">
            {showAll
              ? `${activities.length} ${
                  activities.length === 1 ? "item" : "items"
                }`
              : `${displayLimit} of ${activities.length}`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 flex-1">
        {displayedActivities.map((activity, index) => (
          <div key={activity.id} className="group relative">
            <div className="flex items-start gap-3 p-3 hover:bg-[#FAFAFA] rounded-lg transition-all duration-150 cursor-pointer border border-transparent hover:border-[#E5E5E5]">
              <div className="p-2 bg-[#F4F4F5] rounded-lg mt-0.5 group-hover:bg-[#E5E5E5] transition-colors">
                {getEntityIcon(activity.entity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm text-[#171717] leading-relaxed">
                    <span className="font-semibold">{activity.user.name}</span>{" "}
                    <span className="text-[#525252]">
                      {getActionText(activity.action, activity.entity_type)}
                    </span>
                  </p>
                  <p className="text-xs text-[#A3A3A3] whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    }).replace("about ", "")}
                  </p>
                </div>
                <Link
                  href={getEntityLink(activity.entity_type, activity.entity_id)}
                  className="inline-flex items-center text-xs text-[#525252] hover:text-[#171717] transition-colors group-hover:underline"
                >
                  View {activity.entity_type.replace("_", " ")}
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </Link>
              </div>
            </div>
            {index < displayedActivities.length - 1 && (
              <div className="h-px bg-[#F4F4F5] mx-3" />
            )}
          </div>
        ))}

        {hasMore && (
          <div className="pt-3">
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="w-full text-[#525252] hover:text-[#171717] hover:bg-[#FAFAFA] text-sm"
            >
              {showAll ? (
                <>
                  Show Less
                  <ChevronDown className="ml-2 h-4 w-4 rotate-180 transition-transform" />
                </>
              ) : (
                <>
                  Show All ({activities.length - displayLimit} more)
                  <ChevronDown className="ml-2 h-4 w-4 transition-transform" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
