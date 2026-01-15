"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { ProjectFilters } from "@/hooks/use-projects";

interface ProjectFiltersProps {
  onFiltersChange: (filters: ProjectFilters) => void;
}

const STATUS_OPTIONS = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "AI_AGENT", label: "AI Agent" },
  { value: "AUTOMATION", label: "Automation" },
  { value: "SAAS", label: "SaaS" },
  { value: "CONSULTING", label: "Consulting" },
  { value: "OTHER", label: "Other" },
];

export function ProjectFilters({ onFiltersChange }: ProjectFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    const filters: ProjectFilters = {};

    if (search.trim()) {
      filters.search = search.trim();
    }
    if (selectedStatuses.length > 0) {
      filters.status = selectedStatuses;
    }
    if (selectedPriorities.length > 0) {
      filters.priority = selectedPriorities;
    }
    if (selectedTypes.length > 0 && selectedTypes.length === 1) {
      filters.project_type = selectedTypes[0];
    }

    onFiltersChange(filters);
  }, [search, selectedStatuses, selectedPriorities, selectedTypes, onFiltersChange]);

  const handleStatusChange = (value: string, checked: boolean) => {
    setSelectedStatuses((prev) =>
      checked ? [...prev, value] : prev.filter((s) => s !== value)
    );
  };

  const handlePriorityChange = (value: string, checked: boolean) => {
    setSelectedPriorities((prev) =>
      checked ? [...prev, value] : prev.filter((p) => p !== value)
    );
  };

  const handleTypeChange = (value: string, checked: boolean) => {
    setSelectedTypes((prev) =>
      checked ? [...prev, value] : prev.filter((t) => t !== value)
    );
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedTypes([]);
  };

  const hasActiveFilters =
    search.trim() ||
    selectedStatuses.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedTypes.length > 0;

  return (
    <div className="border border-[#E5E5E5] rounded-lg p-4 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#171717]">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-xs text-[#525252] hover:text-[#171717] hover:bg-[#FAFAFA] px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-1.5">
        <Label htmlFor="search" className="text-xs font-medium text-[#525252] uppercase tracking-wide">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A3A3A3]" />
          <Input
            id="search"
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm border-[#E5E5E5] focus:border-[#18181B]"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-[#525252] uppercase tracking-wide">Status</Label>
        <div className="space-y-1.5">
          {STATUS_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${option.value}`}
                checked={selectedStatuses.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleStatusChange(option.value, checked as boolean)
                }
              />
              <label
                htmlFor={`status-${option.value}`}
                className="text-xs text-[#525252] cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-[#525252] uppercase tracking-wide">Priority</Label>
        <div className="space-y-1.5">
          {PRIORITY_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`priority-${option.value}`}
                checked={selectedPriorities.includes(option.value)}
                onCheckedChange={(checked) =>
                  handlePriorityChange(option.value, checked as boolean)
                }
              />
              <label
                htmlFor={`priority-${option.value}`}
                className="text-xs text-[#525252] cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Project Type Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-[#525252] uppercase tracking-wide">
          Project Type
        </Label>
        <div className="space-y-1.5">
          {PROJECT_TYPE_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${option.value}`}
                checked={selectedTypes.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleTypeChange(option.value, checked as boolean)
                }
              />
              <label
                htmlFor={`type-${option.value}`}
                className="text-xs text-[#525252] cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
