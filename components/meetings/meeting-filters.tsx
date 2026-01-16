"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { meetingTypeLabels, meetingTypeValues } from "@/lib/validations/meeting";
import { logger } from "@/lib/logger";

interface MeetingFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function MeetingFilters({ onFilterChange }: MeetingFiltersProps) {
  const [search, setSearch] = useState("");
  const [meetingType, setMeetingType] = useState<string>("ALL");
  const [projectId, setProjectId] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [projects, setProjects] = useState<any[]>([]);

  // Fetch projects for filter
  useEffect(() => {
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
        logger.error("Failed to fetch projects", error, { action: "fetch_projects_for_filter" });
        setProjects([]);
      });
  }, []);

  // Apply filters
  useEffect(() => {
    const filters: any = {};
    if (search) filters.search = search;
    if (meetingType && meetingType !== "ALL") filters.meetingType = meetingType;
    if (projectId && projectId !== "ALL") filters.projectId = projectId;
    if (startDate) filters.startDate = startDate.toISOString();
    if (endDate) filters.endDate = endDate.toISOString();

    onFilterChange(filters);
  }, [search, meetingType, projectId, startDate, endDate, onFilterChange]);

  const handleClear = () => {
    setSearch("");
    setMeetingType("ALL");
    setProjectId("ALL");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const hasActiveFilters =
    search || (meetingType && meetingType !== "ALL") || (projectId && projectId !== "ALL") || startDate || endDate;

  return (
    <div className="space-y-4 p-4 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#171717]">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-[#525252] hover:text-[#171717]"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-xs text-[#525252]">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3A3A3]" />
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meetings..."
              className="pl-9 border-[#E5E5E5] bg-white"
            />
          </div>
        </div>

        {/* Meeting Type */}
        <div className="space-y-2">
          <Label className="text-xs text-[#525252]">Meeting Type</Label>
          <Select value={meetingType} onValueChange={setMeetingType}>
            <SelectTrigger className="border-[#E5E5E5] bg-white">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {meetingTypeValues.map((type) => (
                <SelectItem key={type} value={type}>
                  {meetingTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project */}
        <div className="space-y-2">
          <Label className="text-xs text-[#525252]">Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="border-[#E5E5E5] bg-white">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-xs text-[#525252]">Date Range</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-left border-[#E5E5E5] bg-white"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM d") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-left border-[#E5E5E5] bg-white"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM d") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
