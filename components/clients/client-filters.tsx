"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface ClientFiltersType {
  search?: string;
  industry?: string;
  isActive?: boolean;
  clientType?: string[];
}

interface ClientFiltersProps {
  onFiltersChange: (filters: ClientFiltersType) => void;
}

const CLIENT_TYPE_OPTIONS = [
  { value: "COMPANY", label: "Company" },
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "NONPROFIT", label: "Nonprofit" },
  { value: "GOVERNMENT", label: "Government" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const INDUSTRY_OPTIONS = [
  { value: "Technology", label: "Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" },
  { value: "Retail", label: "Retail" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Education", label: "Education" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Other", label: "Other" },
];

export function ClientFilters({ onFiltersChange }: ClientFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  useEffect(() => {
    const filters: ClientFiltersType = {};

    if (search.trim()) {
      filters.search = search.trim();
    }
    if (selectedTypes.length > 0) {
      filters.clientType = selectedTypes;
    }
    if (selectedStatus.length === 1) {
      filters.isActive = selectedStatus[0] === "active";
    }
    if (selectedIndustries.length > 0 && selectedIndustries.length === 1) {
      filters.industry = selectedIndustries[0];
    }

    onFiltersChange(filters);
  }, [search, selectedTypes, selectedStatus, selectedIndustries, onFiltersChange]);

  const handleTypeChange = (value: string, checked: boolean) => {
    setSelectedTypes((prev) =>
      checked ? [...prev, value] : prev.filter((t) => t !== value)
    );
  };

  const handleStatusChange = (value: string, checked: boolean) => {
    setSelectedStatus((prev) =>
      checked ? [value] : []
    );
  };

  const handleIndustryChange = (value: string, checked: boolean) => {
    setSelectedIndustries((prev) =>
      checked ? [...prev, value] : prev.filter((i) => i !== value)
    );
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedTypes([]);
    setSelectedStatus([]);
    setSelectedIndustries([]);
  };

  const hasActiveFilters =
    search.trim() ||
    selectedTypes.length > 0 ||
    selectedStatus.length > 0 ||
    selectedIndustries.length > 0;

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
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm border-[#E5E5E5] focus:border-[#18181B]"
          />
        </div>
      </div>

      {/* Client Type Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-[#525252] uppercase tracking-wide">Client Type</Label>
        <div className="space-y-1.5">
          {CLIENT_TYPE_OPTIONS.map((option) => (
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

      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-[#525252] uppercase tracking-wide">Status</Label>
        <div className="space-y-1.5">
          {STATUS_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${option.value}`}
                checked={selectedStatus.includes(option.value)}
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

      {/* Industry Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-[#525252] uppercase tracking-wide">
          Industry
        </Label>
        <div className="space-y-1.5">
          {INDUSTRY_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`industry-${option.value}`}
                checked={selectedIndustries.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleIndustryChange(option.value, checked as boolean)
                }
              />
              <label
                htmlFor={`industry-${option.value}`}
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
